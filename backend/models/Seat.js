import mongoose from "mongoose";


const seatSchema =
  new mongoose.Schema(

    {

      /* =========================
         SEAT NUMBER

         Example:
         F1-001
         F2-045
         F3-100
      ========================= */

      seatNumber: {

        type: String,

        required: true,

        trim: true,

      },


      /* =========================
         FLOOR NUMBER

         1 = Silent Study
         2 = Collaborative
         3 = Premium Zone
      ========================= */

      floor: {

        type: Number,

        required: true,

        min: 1,

        max: 3,

      },


      /* =========================
         ZONE NAME
      ========================= */

      zone: {

        type: String,

        required: true,

        enum: [

          "Silent Study",

          "Collaborative",

          "Premium Zone",

        ],

      },


      /* =========================
         SEAT TYPE

         online  → Can be booked
                   digitally.

         physical / offline /
         walkin → Cannot be booked
                   through website.
      ========================= */

      seatType: {

        type: String,

        enum: [

          "online",

          "physical",

          "offline",

          "walkin",

          "walk-in",

        ],

        default: "online",

        lowercase: true,

        trim: true,

      },


      /* =========================
         ACTIVE STATUS

         true  → Seat is usable

         false → Seat is disabled
                 or under maintenance
      ========================= */

      isActive: {

        type: Boolean,

        default: true,

      },

    },

    {

      timestamps: true,

    }

  );


/* =========================================
   PREVENT DUPLICATE SEAT NUMBERS
========================================= */

seatSchema.index(

  {

    seatNumber: 1,

  },

  {

    unique: true,

  }

);


/* =========================================
   CREATE MODEL
========================================= */

const Seat =
  mongoose.model(

    "Seat",

    seatSchema

  );


export default Seat;