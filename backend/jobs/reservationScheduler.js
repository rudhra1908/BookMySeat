import cron from "node-cron";
import Reservation from "../models/Reservation.js";


/* =========================================
   AUTO COMPLETE EXPIRED RESERVATIONS

   Runs every minute.

   If:
   - status = checked-in
   - endTime <= current UTC time

   Then:
   - status becomes completed
   - checkedOutAt is stored
========================================= */

export function startReservationScheduler() {

  cron.schedule(
    "* * * * *",
    async () => {

      try {

        const now = new Date();


        const result =
          await Reservation.updateMany(

            {
              status: "checked-in",

              endTime: {
                $lte: now,
              },
            },

            {
              $set: {

                status:
                  "completed",

                checkedOutAt:
                  now,

                completedAutomatically:
                  true,

              },
            }

          );


        if (
          result.modifiedCount > 0
        ) {

          console.log(
            `${result.modifiedCount} reservation(s) automatically completed`
          );

        }

      }

      catch (
        error
      ) {

        console.error(
          "Reservation scheduler error:",
          error
        );

      }

    },

    {
      timezone: "UTC",
    }

  );


  console.log(
    "Reservation scheduler started"
  );

}