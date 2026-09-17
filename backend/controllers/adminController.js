const User = require("../models/User");

const Reservation = require("../models/Reservation");

const Seat = require("../models/Seat");


/* =========================================
   HELPER FUNCTION

   REMOVE PASSWORD FROM USER RESPONSE
========================================= */

const formatUser = (

  user

) => {


  if (

    !user

  ) {

    return null;

  }


  const userObject =

    user.toObject

      ? user.toObject()

      : user;


  delete userObject.password;


  return userObject;

};


/* =========================================
   GET ADMIN DASHBOARD

   GET /api/admin/dashboard

   ADMIN ONLY
========================================= */

exports.getDashboard = async (

  req,

  res

) => {

  try {


    /* =====================================
       GET TOTAL USERS
    ===================================== */

    const totalUsers =

      await User.countDocuments();


    /* =====================================
       GET ACTIVE USERS
    ===================================== */

    const activeUsers =

      await User.countDocuments({

        isActive:

          true,

      });


    /* =====================================
       GET ADMIN COUNT
    ===================================== */

    const totalAdmins =

      await User.countDocuments({

        role:

          "admin",

      });


    /* =====================================
       GET NORMAL USER COUNT

       SUPPORT BOTH:

       user
       student
    ===================================== */

    const totalStudents =

      await User.countDocuments({

        role: {

          $in: [

            "user",

            "student",

          ],

        },

      });


    /* =====================================
       DEFAULT VALUES

       These are initialized so the
       dashboard will not crash even if
       Reservation or Seat collections
       are temporarily unavailable.
    ===================================== */

    let totalReservations = 0;

    let activeReservations = 0;

    let completedReservations = 0;

    let cancelledReservations = 0;

    let totalSeats = 0;

    let availableSeats = 0;

    let occupiedSeats = 0;


    /* =====================================
       GET RESERVATION STATISTICS
    ===================================== */

    try {


      totalReservations =

        await Reservation.countDocuments();


      activeReservations =

        await Reservation.countDocuments({

          status: {

            $in: [

              "Booked",

              "booked",

              "Confirmed",

              "confirmed",

              "Checked In",

              "checked-in",

              "active",

            ],

          },

        });


      completedReservations =

        await Reservation.countDocuments({

          status: {

            $in: [

              "Completed",

              "completed",

            ],

          },

        });


      cancelledReservations =

        await Reservation.countDocuments({

          status: {

            $in: [

              "Cancelled",

              "cancelled",

            ],

          },

        });


    }

    catch (

      reservationError

    ) {


      console.error(

        "Unable to calculate reservation statistics:",

        reservationError.message

      );


    }


    /* =====================================
       GET SEAT STATISTICS
    ===================================== */

    try {


      totalSeats =

        await Seat.countDocuments();


      availableSeats =

        await Seat.countDocuments({

          status: {

            $in: [

              "Available",

              "available",

            ],

          },

        });


      occupiedSeats =

        await Seat.countDocuments({

          status: {

            $in: [

              "Occupied",

              "occupied",

            ],

          },

        });


    }

    catch (

      seatError

    ) {


      console.error(

        "Unable to calculate seat statistics:",

        seatError.message

      );


    }


    /* =====================================
       RESPONSE
    ===================================== */

    return res.status(200).json({


      message:

        "Admin dashboard data loaded successfully",


      dashboard: {


        users: {


          total:

            totalUsers,


          active:

            activeUsers,


          students:

            totalStudents,


          admins:

            totalAdmins,


        },


        reservations: {


          total:

            totalReservations,


          active:

            activeReservations,


          completed:

            completedReservations,


          cancelled:

            cancelledReservations,


        },


        seats: {


          total:

            totalSeats,


          available:

            availableSeats,


          occupied:

            occupiedSeats,


        },


      },


    });


  }

  catch (

    error

  ) {


    console.error(

      "Admin dashboard error:",

      error

    );


    return res.status(500).json({


      message:

        "Failed to load admin dashboard",


      error:

        error.message,


    });


  }


};


/* =========================================
   GET ALL USERS

   GET /api/admin/users

   ADMIN ONLY
========================================= */

exports.getUsers = async (

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


    return res.status(200).json({


      message:

        "Users loaded successfully",


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


    return res.status(500).json({


      message:

        "Failed to load users",


      error:

        error.message,


    });


  }


};


/* =========================================
   UPDATE USER STATUS

   PUT /api/admin/users/:id/status

   BODY:

   {
     isActive: true
   }

   ADMIN ONLY
========================================= */

exports.updateUserStatus = async (

  req,

  res

) => {

  try {


    const {

      id

    } = req.params;


    const {

      isActive

    } = req.body;


    /* =====================================
       VALIDATE STATUS
    ===================================== */

    if (

      typeof isActive !== "boolean"

    ) {

      return res.status(400).json({


        message:

          "isActive must be either true or false",


      });

    }


    /* =====================================
       FIND USER
    ===================================== */

    const user =

      await User.findById(

        id

      );


    if (

      !user

    ) {

      return res.status(404).json({


        message:

          "User not found",


      });

    }


    /* =====================================
       PREVENT ADMIN FROM DISABLING
       THEIR OWN ACCOUNT
    ===================================== */

    if (

      String(

        user._id

      ) ===

      String(

        req.user._id

      )

    ) {

      return res.status(400).json({


        message:

          "You cannot change the status of your own account",


      });

    }


    /* =====================================
       UPDATE STATUS
    ===================================== */

    user.isActive =

      isActive;


    await user.save();


    return res.status(200).json({


      message:

        isActive

          ? "User account activated successfully"

          : "User account disabled successfully",


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


    return res.status(500).json({


      message:

        "Failed to update user status",


      error:

        error.message,


    });


  }


};


/* =========================================
   GET ALL RESERVATIONS

   GET /api/admin/reservations

   ADMIN ONLY
========================================= */

exports.getReservations = async (

  req,

  res

) => {

  try {


    const reservations =

      await Reservation.find()

        .populate(

          "user",

          "name email studentId role"

        )

        .populate(

          "seat"

        )

        .sort({

          createdAt:

            -1,

        });


    return res.status(200).json({


      message:

        "Reservations loaded successfully",


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


    return res.status(500).json({


      message:

        "Failed to load reservations",


      error:

        error.message,


    });


  }


};


/* =========================================
   CANCEL ANY RESERVATION

   PUT /api/admin/reservations/:id/cancel

   ADMIN ONLY
========================================= */

exports.cancelReservation = async (

  req,

  res

) => {

  try {


    const {

      id

    } = req.params;


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


    /* =====================================
       UPDATE STATUS
    ===================================== */

    reservation.status =

      "Cancelled";


    await reservation.save();


    return res.status(200).json({


      message:

        "Reservation cancelled successfully",


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


    return res.status(500).json({


      message:

        "Failed to cancel reservation",


      error:

        error.message,


    });


  }


};


/* =========================================
   GET ALL SEATS

   GET /api/admin/seats

   ADMIN ONLY
========================================= */

exports.getSeats = async (

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


    return res.status(200).json({


      message:

        "Seats loaded successfully",


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


    return res.status(500).json({


      message:

        "Failed to load seats",


      error:

        error.message,


    });


  }


};


/* =========================================
   CREATE NEW SEAT

   POST /api/admin/seats

   ADMIN ONLY
========================================= */

exports.createSeat = async (

  req,

  res

) => {

  try {


    const {

      seatNumber,

      floor,

      status,

    } = req.body;


    if (

      !seatNumber

    ) {

      return res.status(400).json({


        message:

          "Seat number is required",


      });

    }


    const seat =

      await Seat.create({


        seatNumber,


        floor:


          floor ||

          "1",


        status:


          status ||

          "Available",


      });


    return res.status(201).json({


      message:

        "Seat created successfully",


      seat,


    });


  }

  catch (

    error

  ) {


    console.error(

      "Create admin seat error:",

      error

    );


    return res.status(500).json({


      message:

        "Failed to create seat",


      error:

        error.message,


    });


  }


};


/* =========================================
   UPDATE SEAT

   PUT /api/admin/seats/:id

   ADMIN ONLY
========================================= */

exports.updateSeat = async (

  req,

  res

) => {

  try {


    const {

      id

    } = req.params;


    const updatedSeat =

      await Seat.findByIdAndUpdate(

        id,

        req.body,

        {


          new:

            true,


          runValidators:

            true,


        }

      );


    if (

      !updatedSeat

    ) {

      return res.status(404).json({


        message:

          "Seat not found",


      });

    }


    return res.status(200).json({


      message:

        "Seat updated successfully",


      seat:

        updatedSeat,


    });


  }

  catch (

    error

  ) {


    console.error(

      "Update admin seat error:",

      error

    );


    return res.status(500).json({


      message:

        "Failed to update seat",


      error:

        error.message,


    });


  }


};


/* =========================================
   DELETE SEAT

   DELETE /api/admin/seats/:id

   ADMIN ONLY
========================================= */

exports.deleteSeat = async (

  req,

  res

) => {

  try {


    const {

      id

    } = req.params;


    const deletedSeat =

      await Seat.findByIdAndDelete(

        id

      );


    if (

      !deletedSeat

    ) {

      return res.status(404).json({


        message:

          "Seat not found",


      });

    }


    return res.status(200).json({


      message:

        "Seat deleted successfully",


      seat:

        deletedSeat,


    });


  }

  catch (

    error

  ) {


    console.error(

      "Delete admin seat error:",

      error

    );


    return res.status(500).json({


      message:

        "Failed to delete seat",


      error:

        error.message,


    });


  }


};