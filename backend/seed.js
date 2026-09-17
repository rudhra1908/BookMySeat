require("dotenv").config();

const mongoose =
  require("mongoose");

const Seat =
  require("./models/Seat");


/* =========================================
   DATABASE CONNECTION
========================================= */

const connectDB =
  async () => {

    try {

      console.log(
        "Connecting to MongoDB..."
      );


      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS:
            30000,

          connectTimeoutMS:
            30000,
        }
      );


      console.log(
        "MongoDB Connected Successfully!"
      );

    } catch (error) {

      console.error(
        "MongoDB Connection Failed:"
      );

      console.error(
        error.message
      );


      process.exit(1);

    }

  };


/* =========================================
   GENERATE SEATS FOR ONE FLOOR

   100 TOTAL SEATS

   FIRST 40:
   → ONLINE / DIGITAL BOOKING

   REMAINING 60:
   → OFFLINE / PHYSICAL BOOKING
========================================= */

const generateFloorSeats =
  (
    floor,
    zone
  ) => {

    const seats = [];


    for (
      let row = 1;
      row <= 10;
      row++
    ) {

      for (
        let col = 1;
        col <= 10;
        col++
      ) {

        const seatPosition =
          ((row - 1) * 10) +
          col;


        const seatNumber =
          `F${floor}-${String(
            seatPosition
          ).padStart(
            3,
            "0"
          )}`;


        /* ===============================
           40% DIGITAL SEATS
        =============================== */

        const isOnlineBookingSeat =
          seatPosition <= 40;


        seats.push({

          /* =============================
             SEAT IDENTIFICATION
          ============================= */

          seatNumber,


          /* =============================
             SEAT TYPE
          ============================= */

          seatType:
            isOnlineBookingSeat
              ? "booking"
              : "offline",


          /* =============================
             OCCUPANCY STATUS
          ============================= */

          occupancyStatus:
            "available",


          /* =============================
             FLOOR DETAILS
          ============================= */

          zone,

          floor,


          /* =============================
             POSITION
          ============================= */

          row,

          col,


          /* =============================
             POWER OUTLET
          ============================= */

          hasPowerOutlet:
            col % 2 === 0,


          /* =============================
             ACTIVE
          ============================= */

          isActive:
            true,

        });

      }

    }


    return seats;

  };


/* =========================================
   GENERATE ALL FLOORS

   FLOOR 1 → 100 SEATS
   FLOOR 2 → 100 SEATS
   FLOOR 3 → 100 SEATS

   TOTAL → 300 SEATS
========================================= */

const generateSeats =
  () => {

    const floor1Seats =
      generateFloorSeats(
        1,
        "Silent Study"
      );


    const floor2Seats =
      generateFloorSeats(
        2,
        "Collaborative"
      );


    const floor3Seats =
      generateFloorSeats(
        3,
        "Premium Zone"
      );


    return [

      ...floor1Seats,

      ...floor2Seats,

      ...floor3Seats,

    ];

  };


/* =========================================
   SEED DATABASE
========================================= */

const seedDatabase =
  async () => {

    try {

      await connectDB();


      console.log(
        "Removing existing seats..."
      );


      await Seat.deleteMany(
        {}
      );


      console.log(
        "Generating seat data..."
      );


      const seats =
        generateSeats();


      console.log(
        `Creating ${seats.length} seats...`
      );


      await Seat.insertMany(
        seats
      );


      /* =====================================
         STATISTICS
      ===================================== */

      const onlineSeats =
        seats.filter(
          (seat) =>
            seat.seatType ===
            "booking"
        ).length;


      const offlineSeats =
        seats.filter(
          (seat) =>
            seat.seatType ===
            "offline"
        ).length;


      console.log("");

      console.log(
        "========================================"
      );

      console.log(
        "SEAT DATABASE SEEDED SUCCESSFULLY"
      );

      console.log(
        "========================================"
      );


      console.log("");

      console.log(
        "FLOOR 1"
      );

      console.log(
        "Total Seats: 100"
      );

      console.log(
        "Online Booking Seats: 40"
      );

      console.log(
        "Offline / Physical Seats: 60"
      );


      console.log("");

      console.log(
        "FLOOR 2"
      );

      console.log(
        "Total Seats: 100"
      );

      console.log(
        "Online Booking Seats: 40"
      );

      console.log(
        "Offline / Physical Seats: 60"
      );


      console.log("");

      console.log(
        "FLOOR 3"
      );

      console.log(
        "Total Seats: 100"
      );

      console.log(
        "Online Booking Seats: 40"
      );

      console.log(
        "Offline / Physical Seats: 60"
      );


      console.log("");

      console.log(
        "----------------------------------------"
      );


      console.log(
        `TOTAL SEATS: ${seats.length}`
      );


      console.log(
        `DIGITAL BOOKING SEATS: ${onlineSeats}`
      );


      console.log(
        `OFFLINE / PHYSICAL SEATS: ${offlineSeats}`
      );


      console.log(
        "========================================"
      );


      await mongoose.connection.close();


      console.log(
        "MongoDB connection closed."
      );


      process.exit(0);

    } catch (error) {

      console.error(
        "Seeding failed:"
      );

      console.error(
        error
      );


      await mongoose.connection.close();


      process.exit(1);

    }

  };


/* =========================================
   RUN SEED
========================================= */

seedDatabase();