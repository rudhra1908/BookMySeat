const mongoose =
  require("mongoose");


const Seat =
  require(
    "../models/Seat"
  );


const Reservation =
  require(
    "../models/Reservation"
  );


const {
  expireOverdueReservations,
} =
  require(
    "../utils/expireReservations"
  );


/* =========================================
   GET ALL SEATS

   GET /api/seats
========================================= */

exports.getAllSeats =
  async (
    req,
    res
  ) => {

    try {

      const seats =
        await Seat.find({

          isActive:
            true,

        })

          .sort({

            floor:
              1,

            row:
              1,

            col:
              1,

          });


      const totalSeats =
        seats.length;


      const bookingSeats =
        seats.filter(
          (
            seat
          ) =>
            seat.seatType ===
            "booking"
        );


      const offlineSeats =
        seats.filter(
          (
            seat
          ) =>
            seat.seatType ===
            "offline"
        );


      const availableOfflineSeats =
        offlineSeats.filter(
          (
            seat
          ) =>
            seat.occupancyStatus ===
            "available"
        );


      const occupiedOfflineSeats =
        offlineSeats.filter(
          (
            seat
          ) =>
            seat.occupancyStatus ===
            "occupied"
        );


      return res
        .status(200)
        .json({

          seats,

          summary: {

            totalSeats,

            bookingSeats:
              bookingSeats.length,

            offlineSeats:
              offlineSeats.length,

            availableOfflineSeats:
              availableOfflineSeats.length,

            occupiedOfflineSeats:
              occupiedOfflineSeats.length,

          },

        });

    } catch (
      error
    ) {

      console.error(

        "Failed to fetch seats:",

        error

      );


      return res
        .status(500)
        .json({

          message:
            "Failed to fetch seats",

          error:
            error.message,

        });

    }

  };


/* =========================================
   GET BOOKING AVAILABILITY

   GET /api/seats/availability

   Only "booking" seats can be reserved
   through the online application.
========================================= */

exports.getAvailability =
  async (
    req,
    res
  ) => {

    try {

      const {
        date,
        startTime,
        endTime,
      } =
        req.query;


      if (

        !date ||
        !startTime ||
        !endTime

      ) {

        return res
          .status(400)
          .json({

            message:
              "date, startTime and endTime are required",

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


      if (

        Number.isNaN(
          start.getTime()
        ) ||

        Number.isNaN(
          end.getTime()
        ) ||

        end <= start

      ) {

        return res
          .status(400)
          .json({

            message:
              "Invalid time range",

          });

      }


      /* =====================================
         EXPIRE OVERDUE RESERVATIONS
      ===================================== */

      await expireOverdueReservations();


      /* =====================================
         GET ONLINE BOOKING SEATS
      ===================================== */

      const seats =
        await Seat.find({

          isActive:
            true,

          seatType:
            "booking",

        })

          .sort({

            floor:
              1,

            row:
              1,

            col:
              1,

          });


      /* =====================================
         FIND OVERLAPPING RESERVATIONS
      ===================================== */

      const overlappingReservations =
        await Reservation.find({

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

        })

          .select(
            "seat"
          );


      /* =====================================
         STORE RESERVED SEAT IDS
      ===================================== */

      const bookedSeatIds =
        new Set(

          overlappingReservations.map(
            (
              reservation
            ) =>
              reservation.seat
                .toString()
          )

        );


      /* =====================================
         ADD AVAILABILITY PROPERTY
      ===================================== */

      const result =
        seats.map(
          (
            seat
          ) => ({

            ...seat.toObject(),

            available:

              !bookedSeatIds.has(
                seat._id
                  .toString()
              ),

          })
        );


      const availableCount =
        result.filter(
          (
            seat
          ) =>
            seat.available ===
            true
        ).length;


      const bookedCount =
        result.filter(
          (
            seat
          ) =>
            seat.available ===
            false
        ).length;


      return res
        .status(200)
        .json({

          seats:
            result,

          summary: {

            totalBookingSeats:
              result.length,

            availableBookingSeats:
              availableCount,

            reservedBookingSeats:
              bookedCount,

          },

        });

    } catch (
      error
    ) {

      console.error(

        "Failed to fetch seat availability:",

        error

      );


      return res
        .status(500)
        .json({

          message:
            "Failed to fetch seat availability",

          error:
            error.message,

        });

    }

  };


/* =========================================
   GET LIVE SEAT STATUS

   GET /api/seats/live-status
========================================= */

exports.getLiveStatus =
  async (
    req,
    res
  ) => {

    try {

      await expireOverdueReservations();


      const seats =
        await Seat.find({

          isActive:
            true,

        })

          .sort({

            floor:
              1,

            row:
              1,

            col:
              1,

          });


      const now =
        new Date();


      const activeReservations =
        await Reservation.find({

          status: {

            $in:
              Reservation.ACTIVE_STATUSES,

          },

          startTime: {

            $lte:
              now,

          },

          endTime: {

            $gte:
              now,

          },

        })

          .select(
            "seat status"
          );


      const activeSeatIds =
        new Set(

          activeReservations.map(
            (
              reservation
            ) =>
              reservation.seat
                .toString()
          )

        );


      const result =
        seats.map(
          (
            seat
          ) => {

            const seatObject =
              seat.toObject();


            const isReserved =
              activeSeatIds.has(

                seat._id
                  .toString()

              );


            return {

              ...seatObject,

              available:

                seat.seatType ===
                "booking"

                  ? !isReserved

                  : seat.occupancyStatus ===
                    "available",

            };

          }
        );


      const bookingSeats =
        seats.filter(
          (
            seat
          ) =>
            seat.seatType ===
            "booking"
        );


      const offlineSeats =
        seats.filter(
          (
            seat
          ) =>
            seat.seatType ===
            "offline"
        );


      const occupiedOfflineSeats =
        offlineSeats.filter(
          (
            seat
          ) =>
            seat.occupancyStatus ===
            "occupied"
        );


      const availableOfflineSeats =
        offlineSeats.filter(
          (
            seat
          ) =>
            seat.occupancyStatus ===
            "available"
        );


      return res
        .status(200)
        .json({

          seats:
            result,

          summary: {

            totalSeats:
              seats.length,

            booking: {

              total:
                bookingSeats.length,

              activeReservations:
                activeSeatIds.size,

            },

            offline: {

              total:
                offlineSeats.length,

              available:
                availableOfflineSeats.length,

              occupied:
                occupiedOfflineSeats.length,

            },

          },

        });

    } catch (
      error
    ) {

      console.error(

        "Failed to fetch live seat status:",

        error

      );


      return res
        .status(500)
        .json({

          message:
            "Failed to fetch live seat status",

          error:
            error.message,

        });

    }

  };


/* =========================================
   CREATE SEAT

   POST /api/seats

   ADMIN ONLY
========================================= */

exports.createSeat =
  async (
    req,
    res
  ) => {

    try {

      const {

        seatNumber,

        seatType,

        occupancyStatus,

        zone,

        floor,

        row,

        col,

        hasPowerOutlet,

        isActive,

      } =
        req.body;


      if (

        !seatNumber ||
        !zone ||
        floor === undefined ||
        row === undefined ||
        col === undefined

      ) {

        return res
          .status(400)
          .json({

            message:
              "seatNumber, zone, floor, row and col are required",

          });

      }


      if (

        seatType &&

        ![
          "booking",
          "offline",
        ].includes(
          seatType
        )

      ) {

        return res
          .status(400)
          .json({

            message:
              "seatType must be either booking or offline",

          });

      }


      const existingSeat =
        await Seat.findOne({

          seatNumber,

        });


      if (
        existingSeat
      ) {

        return res
          .status(409)
          .json({

            message:
              "A seat with this seat number already exists",

          });

      }


      const seat =
        await Seat.create({

          seatNumber,

          seatType:
            seatType ||
            "booking",

          occupancyStatus:
            occupancyStatus ||
            "available",

          zone,

          floor,

          row,

          col,

          hasPowerOutlet:
            Boolean(
              hasPowerOutlet
            ),

          isActive:

            isActive === undefined

              ? true

              : Boolean(
                  isActive
                ),

        });


      return res
        .status(201)
        .json({

          message:
            "Seat created successfully",

          seat,

        });

    } catch (
      error
    ) {

      console.error(

        "Failed to create seat:",

        error

      );


      return res
        .status(500)
        .json({

          message:
            "Failed to create seat",

          error:
            error.message,

        });

    }

  };


/* =========================================
   UPDATE SEAT

   PUT /api/seats/:id

   ADMIN ONLY
========================================= */

exports.updateSeat =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } =
        req.params;


      if (

        !mongoose.Types
          .ObjectId
          .isValid(
            id
          )

      ) {

        return res
          .status(400)
          .json({

            message:
              "Invalid seat ID",

          });

      }


      const allowedFields = [

        "seatNumber",

        "seatType",

        "occupancyStatus",

        "zone",

        "floor",

        "row",

        "col",

        "hasPowerOutlet",

        "isActive",

      ];


      const updateData =
        {};


      allowedFields.forEach(
        (
          field
        ) => {

          if (

            req.body[
              field
            ] !== undefined

          ) {

            updateData[
              field
            ] =
              req.body[
                field
              ];

          }

        }
      );


      if (

        updateData.seatType &&

        ![
          "booking",
          "offline",
        ].includes(
          updateData.seatType
        )

      ) {

        return res
          .status(400)
          .json({

            message:
              "seatType must be either booking or offline",

          });

      }


      if (

        updateData.occupancyStatus &&

        ![
          "available",
          "occupied",
        ].includes(
          updateData
            .occupancyStatus
        )

      ) {

        return res
          .status(400)
          .json({

            message:
              "occupancyStatus must be either available or occupied",

          });

      }


      const seat =
        await Seat.findByIdAndUpdate(

          id,

          updateData,

          {

            new:
              true,

            runValidators:
              true,

          }

        );


      if (
        !seat
      ) {

        return res
          .status(404)
          .json({

            message:
              "Seat not found",

          });

      }


      return res
        .status(200)
        .json({

          message:
            "Seat updated successfully",

          seat,

        });

    } catch (
      error
    ) {

      console.error(

        "Failed to update seat:",

        error

      );


      return res
        .status(500)
        .json({

          message:
            "Failed to update seat",

          error:
            error.message,

        });

    }

  };


/* =========================================
   DELETE SEAT

   DELETE /api/seats/:id

   ADMIN ONLY
========================================= */

exports.deleteSeat =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } =
        req.params;


      if (

        !mongoose.Types
          .ObjectId
          .isValid(
            id
          )

      ) {

        return res
          .status(400)
          .json({

            message:
              "Invalid seat ID",

          });

      }


      const seat =
        await Seat.findByIdAndDelete(
          id
        );


      if (
        !seat
      ) {

        return res
          .status(404)
          .json({

            message:
              "Seat not found",

          });

      }


      return res
        .status(200)
        .json({

          message:
            "Seat deleted successfully",

          seat,

        });

    } catch (
      error
    ) {

      console.error(

        "Failed to delete seat:",

        error

      );


      return res
        .status(500)
        .json({

          message:
            "Failed to delete seat",

          error:
            error.message,

        });

    }

  };