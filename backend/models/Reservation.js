import mongoose from "mongoose";


/* =========================================
   RESERVATION SCHEMA
========================================= */

const reservationSchema =
  new mongoose.Schema(
    {

      /* =====================================
         USER

         USER WHO CREATED THE RESERVATION
      ===================================== */

      user: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

      },


      /* =====================================
         SEAT

         RESERVED SEAT
      ===================================== */

      seat: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Seat",

        required:
          true,

      },


      /* =====================================
         BOOKING START TIME

         SCHEDULED START TIME
      ===================================== */

      startTime: {

        type:
          Date,

        required:
          true,

      },


      /* =====================================
         BOOKING END TIME

         SCHEDULED END TIME

         IMPORTANT:

         For automatic checkout this is
         also the value used for:

         checkedOutAt

         when the user forgets to manually
         checkout.
      ===================================== */

      endTime: {

        type:
          Date,

        required:
          true,

      },


      /* =====================================
         CHECK-IN DEADLINE

         Default booking policy:

         START TIME + 30 MINUTES

         Example:

         2:00 PM start
         2:30 PM deadline

         If the student has not checked in
         by the deadline:

         booked -> expired
      ===================================== */

      checkInDeadline: {

        type:
          Date,

        required:
          true,

      },


      /* =====================================
         RESERVATION STATUS

         booked
         checked-in
         completed
         cancelled
         expired
      ===================================== */

      status: {

        type:
          String,

        enum: [

          "booked",

          "checked-in",

          "completed",

          "cancelled",

          "expired",

        ],

        default:
          "booked",

        required:
          true,

      },


      /* =====================================
         ACTUAL CHECK-IN TIME

         This stores the real time at which
         the student/admin performed check-in.

         Example:

         Scheduled:
         2:00 PM

         Actual check-in:
         2:25 PM

         checkedInAt:
         2:25 PM
      ===================================== */

      checkedInAt: {

        type:
          Date,

        default:
          null,

      },


      /* =====================================
         ACTUAL CHECK-OUT TIME

         MANUAL CHECKOUT:

         Stores the actual time the student
         pressed checkout.

         Example:

         Scheduled end:
         4:00 PM

         Student checks out:
         3:40 PM

         checkedOutAt:
         3:40 PM


         AUTOMATIC CHECKOUT:

         If student does not checkout:

         checkedOutAt:
         scheduled endTime

         Example:

         endTime:
         4:00 PM

         Automatic checkedOutAt:
         4:00 PM

         IMPORTANT:

         It must NOT be the server detection
         time.
      ===================================== */

      checkedOutAt: {

        type:
          Date,

        default:
          null,

      },


      /* =====================================
         CANCELLATION REASON

         Examples:

         Cancelled by user
         Cancelled by admin
      ===================================== */

      cancellationReason: {

        type:
          String,

        default:
          null,

        trim:
          true,

      },


      /* =====================================
         ACTUAL CANCELLATION TIME
      ===================================== */

      cancelledAt: {

        type:
          Date,

        default:
          null,

      },

    },

    {

      /* =====================================
         MONGOOSE AUTOMATIC TIMESTAMPS

         createdAt
         updatedAt
      ===================================== */

      timestamps:
        true,

    }
  );


/* =========================================
   RESERVATION MODEL

   Prevent duplicate model compilation
   during development / hot reload.
========================================= */

const Reservation =
  mongoose.models.Reservation ||
  mongoose.model(
    "Reservation",
    reservationSchema
  );


/* =========================================
   EXPORT
========================================= */

export default Reservation;