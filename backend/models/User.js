import mongoose from "mongoose";

import bcrypt from "bcryptjs";


/* =========================================
   USER SCHEMA
========================================= */

const userSchema =

  new mongoose.Schema(

    {


      /* =====================================
         NAME
      ===================================== */

      name: {

        type:
          String,

        required:
          true,

        trim:
          true,

      },


      /* =====================================
         EMAIL
      ===================================== */

      email: {

        type:
          String,

        required:
          true,

        unique:
          true,

        lowercase:
          true,

        trim:
          true,

      },


      /* =====================================
         STUDENT ID

         Optional because existing users
         may not have this field.
      ===================================== */

      studentId: {

        type:
          String,

        trim:
          true,

        default:
          "",

      },


      /* =====================================
         PASSWORD
      ===================================== */

      password: {

        type:
          String,

        required:
          true,

        minlength:
          6,

      },


      /* =====================================
         USER ROLE

         user    -> Normal user
         student -> Student
         admin   -> Administrator
      ===================================== */

      role: {

        type:
          String,

        enum: [

          "user",

          "student",

          "admin",

        ],

        default:
          "user",

        trim:
          true,

        lowercase:
          true,

      },


      /* =====================================
         ACCOUNT STATUS
      ===================================== */

      isActive: {

        type:
          Boolean,

        default:
          true,

      },


    },

    {


      /* =====================================
         TIMESTAMPS
      ===================================== */

      timestamps:
        true,


    }

  );


/* =========================================
   HASH PASSWORD BEFORE SAVING
========================================= */

userSchema.pre(

  "save",

  async function (

    next

  ) {


    try {


      /* ===================================
         HASH PASSWORD ONLY IF MODIFIED
      =================================== */

      if (

        !this.isModified(
          "password"
        )

      ) {


        return next();


      }


      /* ===================================
         GENERATE SALT
      =================================== */

      const salt =

        await bcrypt.genSalt(

          10

        );


      /* ===================================
         HASH PASSWORD
      =================================== */

      this.password =

        await bcrypt.hash(

          this.password,

          salt

        );


      /* ===================================
         CONTINUE SAVE OPERATION
      =================================== */

      next();


    }

    catch (

      error

    ) {


      next(

        error

      );


    }


  }

);


/* =========================================
   PASSWORD COMPARISON METHOD
========================================= */

userSchema.methods.comparePassword =

  async function (

    enteredPassword

  ) {


    return await bcrypt.compare(

      enteredPassword,

      this.password

    );


  };


/* =========================================
   USER MODEL

   Reuse existing model if already created.
========================================= */

const User =

  mongoose.models.User ||

  mongoose.model(

    "User",

    userSchema

  );


/* =========================================
   EXPORT USER MODEL

   IMPORTANT:

   This MUST be:

   export default User;

   because your server.js uses:

   import User from "./models/User.js";
========================================= */

export default User;