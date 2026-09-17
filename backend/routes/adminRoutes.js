import express from "express";

import User from "../models/User.js";

import Seat from "../models/Seat.js";

import Reservation from "../models/Reservation.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";


/* =========================================
   ROUTER
========================================= */

const router =

  express.Router();


/* =========================================
   GET ADMIN DASHBOARD STATISTICS

   GET:

   /api/admin/dashboard
========================================= */

router.get(

  "/dashboard",

  protect,

  adminOnly,

  async (

    req,

    res

  ) => {


    try {


      /* =====================================
         CURRENT TIME
      ===================================== */

      const now =

        new Date();


      /* =====================================
         TOTAL USERS
      ===================================== */

      const totalUsers =

        await User.countDocuments();


      /* =====================================
         TOTAL SEATS
      ===================================== */

      const totalSeats =

        await Seat.countDocuments();


      /* =====================================
         ACTIVE SEATS
      ===================================== */

      const activeSeats =

        await Seat.countDocuments({

          isActive: {

            $ne:
              false,

          },

        });


      /* =====================================
         TOTAL RESERVATIONS
      ===================================== */

      const totalReservations =

        await Reservation.countDocuments();


      /* =====================================
         BOOKED RESERVATIONS
      ===================================== */

      const bookedReservations =

        await Reservation.countDocuments({

          status:
            "booked",

        });


      /* =====================================
         CHECKED-IN RESERVATIONS
      ===================================== */

      const checkedInReservations =

        await Reservation.countDocuments({

          status:
            "checked-in",

        });


      /* =====================================
         ACTIVE RESERVATIONS

         booked + checked-in
      ===================================== */

      const activeReservations =

        bookedReservations +

        checkedInReservations;


      /* =====================================
         COMPLETED RESERVATIONS
      ===================================== */

      const completedReservations =

        await Reservation.countDocuments({

          status:
            "completed",

        });


      /* =====================================
         CANCELLED RESERVATIONS
      ===================================== */

      const cancelledReservations =

        await Reservation.countDocuments({

          status:
            "cancelled",

        });


      /* =====================================
         TOTAL CHECK-INS

         A reservation is considered
         checked in if checkedInAt exists.
      ===================================== */

      const totalCheckIns =

        await Reservation.countDocuments({

          checkedInAt: {

            $ne:
              null,

          },

        });


      /* =====================================
         TOTAL CHECK-OUTS

         A reservation is considered
         checked out if checkedOutAt exists.
      ===================================== */

      const totalCheckOuts =

        await Reservation.countDocuments({

          checkedOutAt: {

            $ne:
              null,

          },

        });


      /* =====================================
         TODAY START
      ===================================== */

      const todayStart =

        new Date(

          now.getFullYear(),

          now.getMonth(),

          now.getDate(),

          0,

          0,

          0

        );


      /* =====================================
         TODAY END
      ===================================== */

      const tomorrowStart =

        new Date(

          todayStart.getTime() +

          24 * 60 * 60 * 1000

        );


      /* =====================================
         TODAY'S RESERVATIONS
      ===================================== */

      const todayReservations =

        await Reservation.countDocuments({

          startTime: {

            $gte:
              todayStart,

            $lt:
              tomorrowStart,

          },

        });


      /* =====================================
         TODAY'S CHECK-INS
      ===================================== */

      const todayCheckIns =

        await Reservation.countDocuments({

          checkedInAt: {

            $gte:
              todayStart,

            $lt:
              tomorrowStart,

          },

        });


      /* =====================================
         TODAY'S CHECK-OUTS
      ===================================== */

      const todayCheckOuts =

        await Reservation.countDocuments({

          checkedOutAt: {

            $gte:
              todayStart,

            $lt:
              tomorrowStart,

          },

        });


      /* =====================================
         RECENT RESERVATIONS
      ===================================== */

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


      /* =====================================
         RECENT CHECK-IN / CHECK-OUT ACTIVITY
      ===================================== */

      const recentActivity =

        await Reservation.find({

          $or: [

            {

              checkedInAt: {

                $ne:
                  null,

              },

            },

            {

              checkedOutAt: {

                $ne:
                  null,

              },

            },

          ],

        })

          .populate(

            "user",

            "name email"

          )

          .populate(

            "seat"

          )

          .sort({

            updatedAt:
              -1,

          })

          .limit(

            20

          );


      /* =====================================
         RESPONSE
      ===================================== */

      res.status(

        200

      ).json({


        message:
          "Admin dashboard data loaded successfully",


        statistics: {


          /* USERS */

          totalUsers,


          /* SEATS */

          totalSeats,

          activeSeats,


          /* RESERVATIONS */

          totalReservations,

          bookedReservations,

          checkedInReservations,

          activeReservations,

          completedReservations,

          cancelledReservations,


          /* CHECK-IN / CHECK-OUT */

          totalCheckIns,

          totalCheckOuts,


          /* TODAY */

          todayReservations,

          todayCheckIns,

          todayCheckOuts,


        },


        recentReservations,


        recentActivity,


      });


    }

    catch (

      error

    ) {


      console.error(

        "Admin dashboard error:",

        error

      );


      res.status(

        500

      ).json({

        message:
          "Failed to load admin dashboard.",

      });


    }


  }

);


/* =========================================
   GET ALL RESERVATIONS

   GET:

   /api/admin/reservations
========================================= */

router.get(

  "/reservations",

  protect,

  adminOnly,

  async (

    req,

    res

  ) => {


    try {


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


      res.status(

        200

      ).json({


        reservations,


      });


    }

    catch (

      error

    ) {


      console.error(

        "Admin reservations error:",

        error

      );


      res.status(

        500

      ).json({

        message:
          "Failed to load reservations.",

      });


    }


  }

);


/* =========================================
   GET ALL USERS

   GET:

   /api/admin/users
========================================= */

router.get(

  "/users",

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


      res.status(

        200

      ).json({


        users,


      });


    }

    catch (

      error

    ) {


      console.error(

        "Admin users error:",

        error

      );


      res.status(

        500

      ).json({

        message:
          "Failed to load users.",

      });


    }


  }

);


/* =========================================
   GET CHECK-IN / CHECK-OUT ACTIVITY

   GET:

   /api/admin/activity
========================================= */

router.get(

  "/activity",

  protect,

  adminOnly,

  async (

    req,

    res

  ) => {


    try {


      const activity =

        await Reservation.find({

          $or: [

            {

              checkedInAt: {

                $ne:
                  null,

              },

            },

            {

              checkedOutAt: {

                $ne:
                  null,

              },

            },

          ],

        })

          .populate(

            "user",

            "name email"

          )

          .populate(

            "seat"

          )

          .sort({

            updatedAt:
              -1,

          });


      res.status(

        200

      ).json({


        activity,


      });


    }

    catch (

      error

    ) {


      console.error(

        "Admin activity error:",

        error

      );


      res.status(

        500

      ).json({

        message:
          "Failed to load activity.",

      });


    }


  }

);


/* =========================================
   EXPORT ROUTER
========================================= */

export default router;