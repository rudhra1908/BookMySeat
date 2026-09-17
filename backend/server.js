import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import Seat from "./models/Seat.js";
import Reservation from "./models/Reservation.js";

import {
  protect,
} from "./middleware/authMiddleware.js";

import {
  adminOnly,
} from "./middleware/adminMiddleware.js";


/* =========================================
   ENVIRONMENT CONFIGURATION
========================================= */

dotenv.config();


/* =========================================
   EXPRESS APPLICATION
========================================= */

const app = express();


/* =========================================
   PORT
========================================= */

const PORT =
  process.env.PORT ||
  5000;


/* =========================================
   MIDDLEWARE
========================================= */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    credentials: true,
  })
);


app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =========================================
   DATABASE CONNECTION
========================================= */

const connectDatabase =
  async () => {

    try {

      if (!process.env.MONGO_URI) {

        throw new Error(
          "MONGO_URI is missing in the .env file."
        );

      }


      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS: 10000,
        }
      );


      console.log(
        "MongoDB connected successfully"
      );

    }

    catch (
      error
    ) {

      console.error(
        "MongoDB connection failed:",
        error.message
      );


      console.log(
        "Please check your MONGO_URI and MongoDB Atlas Network Access settings."
      );

    }

  };


/* =========================================
   MONGOOSE CONNECTION EVENTS
========================================= */

mongoose.connection.on(
  "connected",
  () => {

    console.log(
      "MongoDB connection established."
    );

  }
);


mongoose.connection.on(
  "error",
  (
    error
  ) => {

    console.error(
      "MongoDB error:",
      error.message
    );

  }
);


mongoose.connection.on(
  "disconnected",
  () => {

    console.log(
      "MongoDB disconnected."
    );

  }
);


/* =========================================
   HELPER:
   GENERATE JWT TOKEN
========================================= */

const generateToken =
  (
    userId
  ) => {

    return jwt.sign(
      {
        id:
          userId,
      },

      process.env.JWT_SECRET,

      {
        expiresIn:
          process.env.JWT_EXPIRES_IN ||
          "7d",
      }
    );

  };


/* =========================================
   HELPER:
   FORMAT USER
========================================= */

const formatUser =
  (
    user
  ) => {

    if (!user) {

      return null;

    }


    return {

      _id:
        user._id,

      id:
        user._id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,

      isActive:
        user.isActive,

      createdAt:
        user.createdAt,

      updatedAt:
        user.updatedAt,

    };

  };


/* =========================================
   HELPER:
   AUTOMATIC RESERVATION STATUS UPDATE

   RESERVATION LIFECYCLE:

   booked
      |
      | no check-in before deadline
      v
   expired


   booked
      |
      | successful check-in
      v
   checked-in
      |
      | manual checkout
      | OR automatic end time
      v
   completed


   booked / checked-in
      |
      | user/admin cancellation
      v
   cancelled


   IMPORTANT:

   Automatic checkout uses the reservation's
   scheduled endTime.

   Example:

   Scheduled:
   2:00 PM - 4:00 PM

   User checked in:
   2:25 PM

   User forgets to checkout.

   Database becomes:

   status:
   completed

   checkedInAt:
   2:25 PM

   checkedOutAt:
   4:00 PM

   Even if the server detects the booking
   at 10:08 PM, checkedOutAt remains 4:00 PM.
========================================= */

const updateReservationStatuses =
  async () => {

    try {

      if (
        mongoose.connection.readyState !== 1
      ) {

        return;

      }


      const now =
        new Date();


      /* =====================================
         EXPIRE BOOKINGS THAT MISSED
         THEIR CHECK-IN DEADLINE

         Example:

         Start:
         2:00 PM

         Deadline:
         2:30 PM

         No check-in:

         booked -> expired
      ===================================== */

      const expiredReservations =
        await Reservation.find({

          status:
            "booked",

          checkInDeadline: {
            $lt:
              now,
          },

        });


      let expiredCount =
        0;


      for (
        const reservation
        of expiredReservations
      ) {

        /*
         * Double-check the status before
         * updating in case another request
         * changed it while this loop was
         * running.
         */

        if (
          reservation.status !==
          "booked"
        ) {

          continue;

        }


        reservation.status =
          "expired";


        /*
         * An expired reservation was never
         * checked in.

         * Therefore these fields must remain
         * null.
         */

        reservation.checkedInAt =
          null;

        reservation.checkedOutAt =
          null;


        reservation.cancellationReason =
          null;


        await reservation.save();


        expiredCount++;

      }


      /* =====================================
         AUTOMATIC CHECKOUT

         checked-in + endTime reached

         -> completed

         IMPORTANT:

         checkedOutAt = endTime

         NOT new Date()
      ===================================== */

      const reservationsToComplete =
        await Reservation.find({

          status:
            "checked-in",

          endTime: {
            $lte:
              now,
          },

        });


      let autoCompletedCount =
        0;


      for (
        const reservation
        of reservationsToComplete
      ) {

        /*
         * Safety check.
         */

        if (
          reservation.status !==
          "checked-in"
        ) {

          continue;

        }


        const scheduledEndTime =
          new Date(
            reservation.endTime
          );


        if (
          Number.isNaN(
            scheduledEndTime.getTime()
          )
        ) {

          console.error(
            `Unable to automatically complete reservation ${reservation._id}: invalid endTime.`
          );

          continue;

        }


        reservation.status =
          "completed";


        /*
         * CRITICAL FIX:
         *
         * Use the scheduled reservation
         * end time.
         *
         * DO NOT use:
         *
         * new Date()
         */

        reservation.checkedOutAt =
          scheduledEndTime;


        await reservation.save();


        autoCompletedCount++;

      }


      if (
        expiredCount > 0 ||
        autoCompletedCount > 0
      ) {

        console.log(
          `[Reservation Status Update] Expired: ${expiredCount} | Automatically completed: ${autoCompletedCount}`
        );

      }

    }

    catch (
      error
    ) {

      console.error(
        "Automatic reservation status update error:",
        error
      );

    }

  };


/* =========================================
   HEALTH CHECK
========================================= */

app.get(
  "/",
  (
    req,
    res
  ) => {

    return res.status(
      200
    ).json({

      message:
        "BookMySeat API is running",

      status:
        "success",

      database:

        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",

    });

  }
);


/* =========================================
   API HEALTH CHECK
========================================= */

app.get(
  "/api",
  (
    req,
    res
  ) => {

    return res.status(
      200
    ).json({

      message:
        "BookMySeat API is running",

      status:
        "success",

      database:

        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",

    });

  }
);


/* =========================================
   REGISTER USER

   POST /api/auth/register
========================================= */

app.post(
  "/api/auth/register",

  async (
    req,
    res
  ) => {

    try {

      const {
        name,
        email,
        password,
      } =
        req.body;


      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(
          400
        ).json({

          message:
            "Name, email and password are required.",

        });

      }


      if (
        password.length < 6
      ) {

        return res.status(
          400
        ).json({

          message:
            "Password must contain at least 6 characters.",

        });

      }


      const existingUser =
        await User.findOne({

          email:
            email.toLowerCase(),

        });


      if (
        existingUser
      ) {

        return res.status(
          409
        ).json({

          message:
            "A user with this email already exists.",

        });

      }


      const user =
        await User.create({

          name,

          email:
            email.toLowerCase(),

          password,

          role:
            "user",

        });


      const token =
        generateToken(
          user._id
        );


      return res.status(
        201
      ).json({

        message:
          "Registration successful.",

        token,

        user:
          formatUser(
            user
          ),

      });

    }

    catch (
      error
    ) {

      console.error(
        "Registration error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to register user.",

      });

    }

  }
);


/* =========================================
   LOGIN USER

   POST /api/auth/login
========================================= */

app.post(
  "/api/auth/login",

  async (
    req,
    res
  ) => {

    try {

      const {
        email,
        password,
      } =
        req.body;


      if (
        !email ||
        !password
      ) {

        return res.status(
          400
        ).json({

          message:
            "Email and password are required.",

        });

      }


      const user =
        await User.findOne({

          email:
            email.toLowerCase(),

        });


      if (
        !user
      ) {

        return res.status(
          401
        ).json({

          message:
            "Invalid email or password.",

        });

      }


      if (
        user.isActive === false
      ) {

        return res.status(
          403
        ).json({

          message:
            "Your account has been disabled. Please contact the administrator.",

        });

      }


      const passwordMatched =
        await user.comparePassword(
          password
        );


      if (
        !passwordMatched
      ) {

        return res.status(
          401
        ).json({

          message:
            "Invalid email or password.",

        });

      }


      const token =
        generateToken(
          user._id
        );


      return res.status(
        200
      ).json({

        message:
          "Login successful.",

        token,

        user:
          formatUser(
            user
          ),

      });

    }

    catch (
      error
    ) {

      console.error(
        "Login error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to login.",

      });

    }

  }
);


/* =========================================
   GET USER PROFILE

   GET /api/auth/profile
========================================= */

app.get(
  "/api/auth/profile",

  protect,

  async (
    req,
    res
  ) => {

    try {

      return res.status(
        200
      ).json({

        user:
          formatUser(
            req.user
          ),

      });

    }

    catch (
      error
    ) {

      console.error(
        "Profile error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch user profile.",

      });

    }

  }
);


/* =========================================
   GET ALL SEATS

   GET /api/seats
========================================= */

app.get(
  "/api/seats",

  protect,

  async (
    req,
    res
  ) => {

    try {

      const seats =
        await Seat.find()

          .sort({

            floor:
              1,

            seatNumber:
              1,

          });


      return res.status(
        200
      ).json({

        seats,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Get seats error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch seats.",

      });

    }

  }
);


/* =========================================
   GET SEAT AVAILABILITY

   GET /api/seats/availability
========================================= */

app.get(
  "/api/seats/availability",

  protect,

  async (
    req,
    res
  ) => {

    try {

      /*
       * Update stale reservations before
       * calculating seat availability.
       */

      await updateReservationStatuses();


      const {
        startTime,
        endTime,
      } =
        req.query;


      if (
        !startTime ||
        !endTime
      ) {

        return res.status(
          400
        ).json({

          message:
            "startTime and endTime are required.",

        });

      }


      const requestedStart =
        new Date(
          startTime
        );


      const requestedEnd =
        new Date(
          endTime
        );


      if (
        Number.isNaN(
          requestedStart.getTime()
        ) ||

        Number.isNaN(
          requestedEnd.getTime()
        )
      ) {

        return res.status(
          400
        ).json({

          message:
            "Invalid date or time.",

        });

      }


      if (
        requestedEnd <=
        requestedStart
      ) {

        return res.status(
          400
        ).json({

          message:
            "End time must be after start time.",

        });

      }


      const seats =
        await Seat.find()

          .sort({

            floor:
              1,

            seatNumber:
              1,

          });


      const reservations =
        await Reservation.find({

          status: {

            $in: [

              "booked",

              "checked-in",

            ],

          },

          startTime: {

            $lt:
              requestedEnd,

          },

          endTime: {

            $gt:
              requestedStart,

          },

        });


      const reservedSeatIds =
        reservations.map(
          (
            reservation
          ) =>
            String(
              reservation.seat
            )
        );


      const seatsWithAvailability =
        seats.map(
          (
            seat
          ) => {

            const isReserved =
              reservedSeatIds.includes(
                String(
                  seat._id
                )
              );


            return {

              ...seat.toObject(),

              available:
                !isReserved,

              status:

                isReserved
                  ? "occupied"
                  : "available",

            };

          }
        );


      return res.status(
        200
      ).json({

        seats:
          seatsWithAvailability,

        startTime:
          requestedStart,

        endTime:
          requestedEnd,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Seat availability error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to check seat availability.",

      });

    }

  }
);


/* =========================================
   CREATE RESERVATION

   POST /api/reservations
========================================= */

app.post(
  "/api/reservations",

  protect,

  async (
    req,
    res
  ) => {

    try {

      /*
       * Clean up stale reservations before
       * checking whether a seat is occupied.
       */

      await updateReservationStatuses();


      const {
        seatId,
        startTime,
        endTime,
      } =
        req.body;


      if (
        !seatId ||
        !startTime ||
        !endTime
      ) {

        return res.status(
          400
        ).json({

          message:
            "seatId, startTime and endTime are required.",

        });

      }


      const bookingStart =
        new Date(
          startTime
        );


      const bookingEnd =
        new Date(
          endTime
        );


      if (
        Number.isNaN(
          bookingStart.getTime()
        ) ||

        Number.isNaN(
          bookingEnd.getTime()
        )
      ) {

        return res.status(
          400
        ).json({

          message:
            "Invalid booking date or time.",

        });

      }


      if (
        bookingEnd <=
        bookingStart
      ) {

        return res.status(
          400
        ).json({

          message:
            "End time must be after start time.",

        });

      }


      const seat =
        await Seat.findById(
          seatId
        );


      if (
        !seat
      ) {

        return res.status(
          404
        ).json({

          message:
            "Seat not found.",

        });

      }


      const existingReservation =
        await Reservation.findOne({

          seat:
            seatId,

          status: {

            $in: [

              "booked",

              "checked-in",

            ],

          },

          startTime: {

            $lt:
              bookingEnd,

          },

          endTime: {

            $gt:
              bookingStart,

          },

        });


      if (
        existingReservation
      ) {

        return res.status(
          409
        ).json({

          message:
            "This seat is already reserved for the selected time.",

        });

      }


      const checkInDeadline =
        new Date(
          bookingStart.getTime() +
          30 * 60 * 1000
        );


      const reservation =
        await Reservation.create({

          user:
            req.user._id,

          seat:
            seat._id,

          startTime:
            bookingStart,

          endTime:
            bookingEnd,

          checkInDeadline,

          status:
            "booked",

        });


      await reservation.populate(
        "seat"
      );


      await reservation.populate(
        "user",
        "name email role"
      );


      return res.status(
        201
      ).json({

        message:
          "Seat reserved successfully.",

        reservation,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Create reservation error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to create reservation.",

      });

    }

  }
);


/* =========================================
   GET MY RESERVATIONS

   GET /api/reservations/my
========================================= */

app.get(
  "/api/reservations/my",

  protect,

  async (
    req,
    res
  ) => {

    try {

      /*
       * Always update automatic statuses
       * before returning reservations.
       */

      await updateReservationStatuses();


      const reservations =
        await Reservation.find({

          user:
            req.user._id,

        })

          .populate(
            "seat"
          )

          .sort({

            createdAt:
              -1,

          });


      return res.status(
        200
      ).json({

        reservations,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Get my reservations error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch reservations.",

      });

    }

  }
);


/* =========================================
   CHECK IN RESERVATION

   PUT /api/reservations/:id/checkin
========================================= */

app.put(
  "/api/reservations/:id/checkin",

  protect,

  async (
    req,
    res
  ) => {

    try {

      const reservation =
        await Reservation.findOne({

          _id:
            req.params.id,

          user:
            req.user._id,

        })

          .populate(
            "seat"
          );


      if (
        !reservation
      ) {

        return res.status(
          404
        ).json({

          message:
            "Reservation not found.",

        });

      }


      if (
        reservation.status ===
        "cancelled"
      ) {

        return res.status(
          400
        ).json({

          message:
            "Cancelled reservations cannot be checked in.",

        });

      }


      if (
        reservation.status ===
        "expired"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation has expired and cannot be checked in.",

        });

      }


      if (
        reservation.status ===
        "completed"
      ) {

        return res.status(
          400
        ).json({

          message:
            "Completed reservations cannot be checked in.",

        });

      }


      if (
        reservation.status ===
        "checked-in"
      ) {

        return res.status(
          400
        ).json({

          message:
            "You are already checked in.",

        });

      }


      const currentTime =
        new Date();


      /* =====================================
         CHECK-IN TOO EARLY
      ===================================== */

      if (
        currentTime <
        reservation.startTime
      ) {

        return res.status(
          400
        ).json({

          message:
            "Check-in is not available yet. Your reservation has not started.",

        });

      }


      /* =====================================
         CHECK-IN DEADLINE PASSED

         IMPORTANT:

         booked -> expired
      ===================================== */

      if (
        currentTime >
        reservation.checkInDeadline
      ) {

        reservation.status =
          "expired";

        reservation.checkedInAt =
          null;

        reservation.checkedOutAt =
          null;

        await reservation.save();


        return res.status(
          400
        ).json({

          message:
            "Check-in deadline has passed. This reservation has expired.",

          reservation,

        });

      }


      /* =====================================
         RESERVATION ALREADY ENDED
      ===================================== */

      if (
        currentTime >=
        reservation.endTime
      ) {

        reservation.status =
          "expired";

        await reservation.save();


        return res.status(
          400
        ).json({

          message:
            "This reservation has already ended.",

          reservation,

        });

      }


      /* =====================================
         SUCCESSFUL CHECK-IN
      ===================================== */

      reservation.status =
        "checked-in";


      reservation.checkedInAt =
        currentTime;


      reservation.checkedOutAt =
        null;


      await reservation.save();


      return res.status(
        200
      ).json({

        message:
          "Check-in successful.",

        reservation,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Check-in error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to check in.",

      });

    }

  }
);


/* =========================================
   ADMIN QR CHECK-IN

   PUT /api/admin/reservations/:id/checkin

   Admin scans the student's BookingPass QR.

   The QR only identifies the reservation.

   The backend verifies the actual reservation
   stored in MongoDB.

   CHECK-IN RULES:

   - Reservation must exist
   - Reservation must be booked
   - Reservation must not be cancelled
   - Reservation must not be expired
   - Reservation must not be completed
   - Reservation must not already be checked in
   - Current time >= startTime
   - Current time <= checkInDeadline
   - Current time < endTime
========================================= */

app.put(
  "/api/admin/reservations/:id/checkin",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      const reservationId =
        req.params.id;


      /* =====================================
         VALIDATE RESERVATION ID
      ===================================== */

      if (
        !mongoose.isValidObjectId(
          reservationId
        )
      ) {

        return res.status(
          400
        ).json({

          message:
            "Invalid reservation ID.",

        });

      }


      /*
       * Update automatic statuses first.
       *
       * This prevents an expired booking
       * from being treated as active.
       */

      await updateReservationStatuses();


      /* =====================================
         FIND REAL RESERVATION
      ===================================== */

      const reservation =
        await Reservation.findById(
          reservationId
        )

          .populate(
            "user",
            "name email role"
          )

          .populate(
            "seat"
          );


      if (
        !reservation
      ) {

        return res.status(
          404
        ).json({

          message:
            "Reservation not found.",

        });

      }


      /* =====================================
         CANCELLED
      ===================================== */

      if (
        reservation.status ===
        "cancelled"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation has been cancelled.",

          reservation,

        });

      }


      /* =====================================
         EXPIRED
      ===================================== */

      if (
        reservation.status ===
        "expired"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation has expired and cannot be checked in.",

          reservation,

        });

      }


      /* =====================================
         COMPLETED
      ===================================== */

      if (
        reservation.status ===
        "completed"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation has already been completed.",

          reservation,

        });

      }


      /* =====================================
         ALREADY CHECKED IN
      ===================================== */

      if (
        reservation.status ===
        "checked-in"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This student is already checked in.",

          reservation,

        });

      }


      /* =====================================
         ONLY BOOKED RESERVATIONS
      ===================================== */

      if (
        reservation.status !==
        "booked"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation is not available for check-in.",

          reservation,

        });

      }


      /* =====================================
         CURRENT SERVER TIME
      ===================================== */

      const currentTime =
        new Date();


      /* =====================================
         RESERVATION TIMES
      ===================================== */

      const startTime =
        new Date(
          reservation.startTime
        );


      const endTime =
        new Date(
          reservation.endTime
        );


      const checkInDeadline =
        reservation.checkInDeadline

          ? new Date(
              reservation.checkInDeadline
            )

          : new Date(
              startTime.getTime() +
              30 * 60 * 1000
            );


      /* =====================================
         INVALID DATE VALIDATION
      ===================================== */

      if (

        Number.isNaN(
          startTime.getTime()
        )

        ||

        Number.isNaN(
          endTime.getTime()
        )

        ||

        Number.isNaN(
          checkInDeadline.getTime()
        )

      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation contains invalid date or time information.",

          reservation,

        });

      }


      /* =====================================
         CHECK-IN TOO EARLY
      ===================================== */

      if (
        currentTime <
        startTime
      ) {

        return res.status(
          400
        ).json({

          message:
            "Check-in is not available yet. The student's reservation has not started.",

          reservation,

        });

      }


      /* =====================================
         CHECK-IN DEADLINE PASSED

         IMPORTANT:

         If an admin tries to scan after
         the grace period, the booking is
         permanently expired.
      ===================================== */

      if (
        currentTime >
        checkInDeadline
      ) {

        reservation.status =
          "expired";

        reservation.checkedInAt =
          null;

        reservation.checkedOutAt =
          null;

        await reservation.save();


        return res.status(
          400
        ).json({

          message:
            "Check-in deadline has passed. This reservation has expired.",

          reservation,

        });

      }


      /* =====================================
         RESERVATION END TIME PASSED
      ===================================== */

      if (
        currentTime >=
        endTime
      ) {

        reservation.status =
          "expired";

        await reservation.save();


        return res.status(
          400
        ).json({

          message:
            "This reservation has already ended.",

          reservation,

        });

      }


      /* =====================================
         ADMIN CHECK-IN
      ===================================== */

      reservation.status =
        "checked-in";


      reservation.checkedInAt =
        currentTime;


      reservation.checkedOutAt =
        null;


      await reservation.save();


      /* =====================================
         RETURN UPDATED RESERVATION
      ===================================== */

      return res.status(
        200
      ).json({

        message:
          "Student checked in successfully.",

        reservation,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Admin QR check-in error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to check in the student.",

      });

    }

  }
);


/* =========================================
   COMPLETE RESERVATION

   PUT /api/reservations/:id/complete

   MANUAL CHECKOUT

   IMPORTANT:

   For a manual checkout, checkedOutAt
   represents the actual time the user
   pressed checkout.

   Example:

   Booking:
   2:00 PM - 4:00 PM

   User checks out:
   3:40 PM

   checkedOutAt:
   3:40 PM
========================================= */

app.put(
  "/api/reservations/:id/complete",

  protect,

  async (
    req,
    res
  ) => {

    try {

      const reservation =
        await Reservation.findOne({

          _id:
            req.params.id,

          user:
            req.user._id,

        })

          .populate(
            "seat"
          );


      if (
        !reservation
      ) {

        return res.status(
          404
        ).json({

          message:
            "Reservation not found.",

        });

      }


      /*
       * If the server is processing this
       * request after the scheduled end time,
       * automatically complete using endTime.
       */

      const currentTime =
        new Date();


      if (
        reservation.status ===
        "checked-in"

        &&

        currentTime >=
        reservation.endTime
      ) {

        reservation.status =
          "completed";


        reservation.checkedOutAt =
          new Date(
            reservation.endTime
          );


        await reservation.save();


        return res.status(
          200
        ).json({

          message:
            "Reservation completed automatically at the scheduled end time.",

          reservation,

        });

      }


      if (
        reservation.status !==
        "checked-in"
      ) {

        return res.status(
          400
        ).json({

          message:
            "You must check in before checking out.",

        });

      }


      /* =====================================
         MANUAL CHECKOUT
      ===================================== */

      reservation.status =
        "completed";


      /*
       * Manual checkout stores the actual
       * checkout time.
       */

      reservation.checkedOutAt =
        currentTime;


      await reservation.save();


      return res.status(
        200
      ).json({

        message:
          "Reservation completed successfully.",

        reservation,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Complete reservation error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to complete reservation.",

      });

    }

  }
);


/* =========================================
   CANCEL RESERVATION

   PUT /api/reservations/:id/cancel
========================================= */

app.put(
  "/api/reservations/:id/cancel",

  protect,

  async (
    req,
    res
  ) => {

    try {

      const {
        cancellationReason,
      } =
        req.body;


      const reservation =
        await Reservation.findOne({

          _id:
            req.params.id,

          user:
            req.user._id,

        })

          .populate(
            "seat"
          );


      if (
        !reservation
      ) {

        return res.status(
          404
        ).json({

          message:
            "Reservation not found.",

        });

      }


      if (
        reservation.status ===
        "completed"
      ) {

        return res.status(
          400
        ).json({

          message:
            "Completed reservations cannot be cancelled.",

        });

      }


      if (
        reservation.status ===
        "cancelled"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation is already cancelled.",

        });

      }


      if (
        reservation.status ===
        "expired"
      ) {

        return res.status(
          400
        ).json({

          message:
            "Expired reservations cannot be cancelled.",

        });

      }


      reservation.status =
        "cancelled";


      reservation.cancellationReason =
        cancellationReason ||
        "Cancelled by user";


      reservation.cancelledAt =
        new Date();


      await reservation.save();


      return res.status(
        200
      ).json({

        message:
          "Reservation cancelled successfully.",

        reservation,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Cancel reservation error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to cancel reservation.",

      });

    }

  }
);


/* =========================================
   GET RESERVATION STATUS

   GET /api/reservations/:id/status
========================================= */

app.get(
  "/api/reservations/:id/status",

  protect,

  async (
    req,
    res
  ) => {

    try {

      /*
       * Make sure automatic lifecycle changes
       * are applied before returning status.
       */

      await updateReservationStatuses();


      const reservation =
        await Reservation.findOne({

          _id:
            req.params.id,

          user:
            req.user._id,

        })

          .populate(
            "seat"
          );


      if (
        !reservation
      ) {

        return res.status(
          404
        ).json({

          message:
            "Reservation not found.",

        });

      }


      const currentTime =
        new Date();


      const checkInAllowed =

        reservation.status ===
        "booked"

        &&

        currentTime >=
        reservation.startTime

        &&

        currentTime <=
        reservation.checkInDeadline

        &&

        currentTime <
        reservation.endTime;


      const remainingCheckInMilliseconds =

        new Date(
          reservation.checkInDeadline
        ).getTime()

        -

        currentTime.getTime();


      const remainingMilliseconds =

        new Date(
          reservation.endTime
        ).getTime()

        -

        currentTime.getTime();


      const remainingCheckInMinutes =
        Math.max(

          0,

          Math.ceil(

            remainingCheckInMilliseconds /

            (
              1000 * 60
            )

          )

        );


      const remainingMinutes =
        Math.max(

          0,

          Math.ceil(

            remainingMilliseconds /

            (
              1000 * 60
            )

          )

        );


      const checkoutReminder =

        reservation.status ===
        "checked-in"

        &&

        remainingMinutes <=
        15

        &&

        remainingMinutes >
        0;


      let message =
        "Reservation status retrieved successfully.";


      if (
        reservation.status ===
        "booked"
      ) {

        message =
          checkInAllowed

            ? "Check-in is available."

            : "Check-in is not available at this time.";

      }


      if (
        reservation.status ===
        "checked-in"
      ) {

        message =
          "You are currently checked in.";

      }


      if (
        reservation.status ===
        "completed"
      ) {

        message =
          "This reservation has been completed.";

      }


      if (
        reservation.status ===
        "cancelled"
      ) {

        message =
          "This reservation has been cancelled.";

      }


      if (
        reservation.status ===
        "expired"
      ) {

        message =
          "This reservation expired because the check-in deadline was missed.";

      }


      return res.status(
        200
      ).json({

        reservation,

        checkInAllowed,

        checkInDeadline:
          reservation.checkInDeadline,

        remainingCheckInMinutes,

        remainingMinutes,

        checkoutReminder,

        message,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Reservation status error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch reservation status.",

      });

    }

  }
);


/* =========================================
   GET ADMIN DASHBOARD

   GET /api/admin/dashboard
========================================= */

app.get(
  "/api/admin/dashboard",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      /*
       * Update automatic statuses before
       * calculating dashboard statistics.
       */

      await updateReservationStatuses();


      const now =
        new Date();


      const [
        totalUsers,
        activeUsers,
        totalReservations,
        bookedReservations,
        checkedInReservations,
        completedReservations,
        cancelledReservations,
        expiredReservations,
        totalSeats,
      ] =
        await Promise.all([

          User.countDocuments(),

          User.countDocuments({
            isActive: true,
          }),

          Reservation.countDocuments(),

          Reservation.countDocuments({
            status:
              "booked",

            endTime: {
              $gt:
                now,
            },

          }),

          Reservation.countDocuments({
            status:
              "checked-in",

            endTime: {
              $gt:
                now,
            },

          }),

          Reservation.countDocuments({
            status:
              "completed",
          }),

          Reservation.countDocuments({
            status:
              "cancelled",
          }),

          Reservation.countDocuments({
            status:
              "expired",
          }),

          Seat.countDocuments(),

        ]);


      const recentReservations =
        await Reservation.find()

          .populate(
            "user",
            "name email role"
          )

          .populate(
            "seat"
          )

          .sort({

            createdAt:
              -1,

          })

          .limit(
            10
          );


      return res.status(
        200
      ).json({

        statistics: {

          totalUsers,

          activeUsers,

          totalReservations,

          bookedReservations,

          checkedInReservations,

          completedReservations,

          cancelledReservations,

          expiredReservations,

          totalSeats,

        },

        recentReservations,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Admin dashboard error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch admin dashboard data.",

      });

    }

  }
);


/* =========================================
   GET ALL ADMIN SEATS

   GET /api/admin/seats

   Admin dashboard uses this endpoint to
   display every seat, including inactive
   and physical/offline seats.
========================================= */

app.get(
  "/api/admin/seats",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      const seats =
        await Seat.find()

          .sort({

            floor:
              1,

            seatNumber:
              1,

          });


      return res.status(
        200
      ).json({

        seats,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Get admin seats error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch seats.",

      });

    }

  }
);


/* =========================================
   GET ALL USERS

   GET /api/admin/users
========================================= */

app.get(
  "/api/admin/users",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      const users =
        await User.find()

          .select(
            "-password"
          )

          .sort({

            createdAt:
              -1,

          });


      return res.status(
        200
      ).json({

        users,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Get admin users error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch users.",

      });

    }

  }
);


/* =========================================
   UPDATE USER STATUS

   PUT /api/admin/users/:id/status
========================================= */

app.put(
  "/api/admin/users/:id/status",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      const {
        isActive,
      } =
        req.body;


      if (
        typeof isActive !==
        "boolean"
      ) {

        return res.status(
          400
        ).json({

          message:
            "isActive must be true or false.",

        });

      }


      const user =
        await User.findById(
          req.params.id
        );


      if (
        !user
      ) {

        return res.status(
          404
        ).json({

          message:
            "User not found.",

        });

      }


      if (
        String(
          user._id
        ) ===
        String(
          req.user._id
        )
      ) {

        return res.status(
          400
        ).json({

          message:
            "You cannot disable your own admin account.",

        });

      }


      user.isActive =
        isActive;


      await user.save();


      return res.status(
        200
      ).json({

        message:

          isActive

            ? "User activated successfully."

            : "User deactivated successfully.",

        user:
          formatUser(
            user
          ),

      });

    }

    catch (
      error
    ) {

      console.error(
        "Update user status error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to update user status.",

      });

    }

  }
);


/* =========================================
   GET ALL RESERVATIONS

   GET /api/admin/reservations
========================================= */

app.get(
  "/api/admin/reservations",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      /*
       * Update automatic statuses before
       * returning reservations to admin.
       */

      await updateReservationStatuses();


      const reservations =
        await Reservation.find()

          .populate(
            "user",
            "name email role"
          )

          .populate(
            "seat"
          )

          .sort({

            createdAt:
              -1,

          });


      return res.status(
        200
      ).json({

        reservations,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Get admin reservations error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to fetch reservations.",

      });

    }

  }
);


/* =========================================
   ADMIN CANCEL RESERVATION

   PUT /api/admin/reservations/:id/cancel

   Admins may cancel any active booking,
   including a booking that is currently
   checked in.

   Completed, expired and already-cancelled
   reservations remain immutable.
========================================= */

app.put(
  "/api/admin/reservations/:id/cancel",

  protect,

  adminOnly,

  async (
    req,
    res
  ) => {

    try {

      const reservation =
        await Reservation.findById(
          req.params.id
        )

          .populate(
            "user",
            "name email role"
          )

          .populate(
            "seat"
          );


      if (
        !reservation
      ) {

        return res.status(
          404
        ).json({

          message:
            "Reservation not found.",

        });

      }


      if (
        reservation.status ===
        "cancelled"
      ) {

        return res.status(
          400
        ).json({

          message:
            "This reservation is already cancelled.",

        });

      }


      if (
        reservation.status ===
        "completed"
      ) {

        return res.status(
          400
        ).json({

          message:
            "Completed reservations cannot be cancelled.",

        });

      }


      if (
        reservation.status ===
        "expired"
      ) {

        return res.status(
          400
        ).json({

          message:
            "Expired reservations cannot be cancelled.",

        });

      }


      reservation.status =
        "cancelled";


      reservation.cancellationReason =
        "Cancelled by admin";


      reservation.cancelledAt =
        new Date();


      await reservation.save();


      return res.status(
        200
      ).json({

        message:
          "Reservation cancelled by admin successfully.",

        reservation,

      });

    }

    catch (
      error
    ) {

      console.error(
        "Admin cancel reservation error:",
        error
      );


      return res.status(
        500
      ).json({

        message:
          "Failed to cancel reservation.",

      });

    }

  }
);


/* =========================================
   404 HANDLER
========================================= */

app.use(
  (
    req,
    res
  ) => {

    return res.status(
      404
    ).json({

      message:
        `Route not found: ${req.method} ${req.originalUrl}`,

    });

  }
);


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Unhandled server error:",
      error
    );


    return res.status(
      500
    ).json({

      message:
        "Internal server error.",

    });

  }
);


/* =========================================
   START SERVER
========================================= */

const startServer =
  async () => {

    await connectDatabase();


    /*
     * =======================================
     * INITIAL STATUS UPDATE
     *
     * Run immediately when the server starts.
     * This cleans up any old reservations
     * that should already be expired or
     * completed.
     * =======================================
     */

    await updateReservationStatuses();


    /*
     * =======================================
     * AUTOMATIC STATUS CHECKER
     *
     * Runs every 15 seconds.
     *
     * This means users do NOT need to:
     *
     * - refresh the page
     * - open My Reservations
     * - open Admin Dashboard
     *
     * for automatic completion/expiry to
     * happen.
     * =======================================
     */

    setInterval(
      async () => {

        await updateReservationStatuses();

      },

      15 * 1000
    );


    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          "Automatic reservation status checker is active."
        );

      }
    );

  };


startServer();