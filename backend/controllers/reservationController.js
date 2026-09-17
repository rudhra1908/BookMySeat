const mongoose =
  require("mongoose");

const Reservation =
  require("../models/Reservation");

const Seat =
  require("../models/Seat");

const Occupancy =
  require("../models/Occupancy");

const {
  expireOverdueReservations,
} =
  require("../utils/expireReservations");


const GRACE_MINUTES =
  parseInt(
    process.env.CHECKIN_GRACE_MINUTES ||
    "15",
    10
  );


const MAX_BOOKING_HOURS =
  4;


const MAX_ADVANCE_DAYS =
  7;


/* =========================================
   POST /api/reservations

   CREATE RESERVATION
========================================= */

exports.createReservation =
  async (
    req,
    res
  ) => {

    try {

      const {

        seatId,

        startTime,

        endTime,

      } = req.body;


      if (

        !seatId ||

        !startTime ||

        !endTime

      ) {

        return res.status(400).json({

          message:
            "seatId, startTime and endTime are required",

        });

      }


      if (

        !mongoose.Types.ObjectId.isValid(
          seatId
        )

      ) {

        return res.status(400).json({

          message:
            "Invalid seat ID",

        });

      }


      const start =
        new Date(
          startTime
        );


      const end =
        new Date(
          endTime
        );


      const now =
        new Date();


      if (

        Number.isNaN(
          start.getTime()
        ) ||

        Number.isNaN(
          end.getTime()
        )

      ) {

        return res.status(400).json({

          message:
            "Invalid startTime or endTime",

        });

      }


      if (
        end <= start
      ) {

        return res.status(400).json({

          message:
            "endTime must be after startTime",

        });

      }


      if (
        start < now
      ) {

        return res.status(400).json({

          message:
            "Cannot book a slot in the past",

        });

      }


      const durationHours =

        (
          end.getTime() -

          start.getTime()
        )

        /

        (
          1000 *
          60 *
          60
        );


      if (
        durationHours >
        MAX_BOOKING_HOURS
      ) {

        return res.status(400).json({

          message:
            `Bookings cannot exceed ${MAX_BOOKING_HOURS} hours`,

        });

      }


      const daysAhead =

        (
          start.getTime() -

          now.getTime()
        )

        /

        (
          1000 *
          60 *
          60 *
          24
        );


      if (
        daysAhead >
        MAX_ADVANCE_DAYS
      ) {

        return res.status(400).json({

          message:
            `Cannot book more than ${MAX_ADVANCE_DAYS} days in advance`,

        });

      }


      /* =====================================
         FIND SEAT
      ===================================== */

      const seat =
        await Seat.findById(
          seatId
        );


      if (

        !seat ||

        !seat.isActive

      ) {

        return res.status(404).json({

          message:
            "Seat not found or unavailable",

        });

      }


      /* =====================================
         ONLY 40% BOOKING SEATS CAN BE
         RESERVED ONLINE
      ===================================== */

      if (
        seat.seatType !==
        "booking"
      ) {

        return res.status(400).json({

          message:
            "This seat is reserved for physical or offline booking only",

        });

      }


      /* =====================================
         CHECK ACTIVE OFFLINE OCCUPANCY
      ===================================== */

      const activeOccupancy =
        await Occupancy.findOne({

          user:
            req.user._id,

          status:
            "checked-in",

        });


      if (
        activeOccupancy
      ) {

        return res.status(400).json({

          message:
            "You are currently checked in to a physical seat",

        });

      }


      await expireOverdueReservations();


      /* =====================================
         CHECK SEAT CONFLICT
      ===================================== */

      const conflict =
        await Reservation.findOne({

          seat:
            seatId,

          status: {

            $in:
              Reservation.ACTIVE_STATUSES,

          },

          startTime: {

            $lt:
              end,

          },

          endTime: {

            $gt:
              start,

          },

        });


      if (
        conflict
      ) {

        return res.status(409).json({

          message:
            "This seat is already booked for the selected time",

        });

      }


      /* =====================================
         CHECK USER CONFLICT
      ===================================== */

      const userConflict =
        await Reservation.findOne({

          student:
            req.user._id,

          status: {

            $in:
              Reservation.ACTIVE_STATUSES,

          },

          startTime: {

            $lt:
              end,

          },

          endTime: {

            $gt:
              start,

          },

        });


      if (
        userConflict
      ) {

        return res.status(409).json({

          message:
            "You already have another reservation during this time",

        });

      }


      /* =====================================
         RESERVATION DATE
      ===================================== */

      const dayStart =
        new Date(
          start
        );


      dayStart.setHours(
        0,
        0,
        0,
        0
      );


      /* =====================================
         CHECK-IN DEADLINE
      ===================================== */

      const checkInDeadline =
        new Date(

          start.getTime() +

          GRACE_MINUTES *

          60 *

          1000

        );


      /* =====================================
         CREATE RESERVATION
      ===================================== */

      const reservation =
        await Reservation.create({

          student:
            req.user._id,

          seat:
            seatId,

          date:
            dayStart,

          startTime:
            start,

          endTime:
            end,

          checkInDeadline,

          status:
            "booked",

        });


      await reservation.populate(

        "seat",

        "seatNumber zone floor seatType"

      );


      return res.status(201).json({

        message:
          "Reservation created successfully",

        reservation,

      });


    } catch (
      err
    ) {

      console.error(
        "Error creating reservation:",
        err
      );


      return res.status(500).json({

        message:
          "Failed to create reservation",

        error:
          err.message,

      });

    }

  };


/* =========================================
   GET MY RESERVATIONS
========================================= */

exports.getMyReservations =
  async (
    req,
    res
  ) => {

    try {

      await expireOverdueReservations();


      const reservations =
        await Reservation.find({

          student:
            req.user._id,

        })

          .populate(

            "seat",

            "seatNumber zone floor seatType"

          )

          .sort({

            startTime:
              -1,

          });


      return res.status(200).json({

        reservations,

      });


    } catch (
      err
    ) {

      console.error(
        "Error fetching reservations:",
        err
      );


      return res.status(500).json({

        message:
          "Failed to fetch reservations",

        error:
          err.message,

      });

    }

  };


/* =========================================
   CANCEL RESERVATION
========================================= */

exports.cancelReservation =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      if (

        !mongoose.Types.ObjectId.isValid(
          id
        )

      ) {

        return res.status(400).json({

          message:
            "Invalid reservation ID",

        });

      }


      const reservation =
        await Reservation.findById(
          id
        );


      if (
        !reservation
      ) {

        return res.status(404).json({

          message:
            "Reservation not found",

        });

      }


      const isOwner =

        reservation.student.toString() ===

        req.user._id.toString();


      if (

        !isOwner &&

        req.user.role !==
        "admin"

      ) {

        return res.status(403).json({

          message:
            "Not authorized to cancel this reservation",

        });

      }


      await expireOverdueReservations();


      if (

        ![
          "booked",
          "checked-in",
        ].includes(
          reservation.status
        )

      ) {

        return res.status(400).json({

          message:
            `Cannot cancel a reservation with status '${reservation.status}'`,

        });

      }


      reservation.status =
        "cancelled";


      reservation.cancelledAt =
        new Date();


      await reservation.save();


      await reservation.populate(

        "seat",

        "seatNumber zone floor seatType"

      );


      return res.status(200).json({

        message:
          "Reservation cancelled successfully",

        reservation,

      });


    } catch (
      err
    ) {

      console.error(
        "Error cancelling reservation:",
        err
      );


      return res.status(500).json({

        message:
          "Failed to cancel reservation",

        error:
          err.message,

      });

    }

  };


/* =========================================
   CHECK IN
========================================= */

exports.checkIn =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      if (

        !mongoose.Types.ObjectId.isValid(
          id
        )

      ) {

        return res.status(400).json({

          message:
            "Invalid reservation ID",

        });

      }


      await expireOverdueReservations();


      const reservation =
        await Reservation.findById(
          id
        );


      if (
        !reservation
      ) {

        return res.status(404).json({

          message:
            "Reservation not found",

        });

      }


      if (

        reservation.student.toString() !==

        req.user._id.toString()

      ) {

        return res.status(403).json({

          message:
            "Not authorized to check in to this reservation",

        });

      }


      if (

        reservation.status !==
        "booked"

      ) {

        return res.status(400).json({

          message:
            `Cannot check in — reservation status is '${reservation.status}'`,

        });

      }


      const now =
        new Date();


      if (
        now >
        reservation.checkInDeadline
      ) {

        reservation.status =
          "expired";


        reservation.expiredAt =
          now;


        await reservation.save();


        return res.status(410).json({

          message:
            "Check-in window has passed; reservation has expired",

        });

      }


      reservation.status =
        "checked-in";


      reservation.checkedInAt =
        now;


      await reservation.save();


      await reservation.populate(

        "seat",

        "seatNumber zone floor seatType"

      );


      return res.status(200).json({

        message:
          "Checked in successfully",

        reservation,

      });


    } catch (
      err
    ) {

      console.error(
        "Error checking in:",
        err
      );


      return res.status(500).json({

        message:
          "Failed to check in",

        error:
          err.message,

      });

    }

  };


/* =========================================
   COMPLETE RESERVATION
========================================= */

exports.completeReservation =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      if (

        !mongoose.Types.ObjectId.isValid(
          id
        )

      ) {

        return res.status(400).json({

          message:
            "Invalid reservation ID",

        });

      }


      const reservation =
        await Reservation.findById(
          id
        );


      if (
        !reservation
      ) {

        return res.status(404).json({

          message:
            "Reservation not found",

        });

      }


      const isOwner =

        reservation.student.toString() ===

        req.user._id.toString();


      if (

        !isOwner &&

        req.user.role !==
        "admin"

      ) {

        return res.status(403).json({

          message:
            "Not authorized",

        });

      }


      if (

        reservation.status !==
        "checked-in"

      ) {

        return res.status(400).json({

          message:
            `Cannot complete — status is '${reservation.status}'`,

        });

      }


      reservation.status =
        "completed";


      reservation.completedAt =
        new Date();


      await reservation.save();


      await reservation.populate(

        "seat",

        "seatNumber zone floor seatType"

      );


      return res.status(200).json({

        message:
          "Reservation marked complete",

        reservation,

      });


    } catch (
      err
    ) {

      console.error(
        "Error completing reservation:",
        err
      );


      return res.status(500).json({

        message:
          "Failed to complete reservation",

        error:
          err.message,

      });

    }

  };