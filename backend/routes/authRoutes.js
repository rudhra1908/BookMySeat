const mongoose = require(

  "mongoose"

);


const bcrypt = require(

  "bcryptjs"

);


/* =========================================
   USER SCHEMA
========================================= */

const userSchema =

  new mongoose.Schema(


    {


      /* ===================================
         NAME
      =================================== */

      name: {


        type:

          String,


        required:

          true,


        trim:

          true,


      },


      /* ===================================
         EMAIL
      =================================== */

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


      /* ===================================
         STUDENT ID

         OPTIONAL BECAUSE EXISTING USERS
         MAY NOT HAVE THIS FIELD.
      =================================== */

      studentId: {


        type:

          String,


        trim:

          true,


        default:

          "",


      },


      /* ===================================
         PASSWORD
      =================================== */

      password: {


        type:

          String,


        required:

          true,


        minlength:

          6,


      },


      /* ===================================
         USER ROLE

         user    -> Normal User
         student -> Existing Student Role
         admin   -> Administrator

         Both user and student are supported
         so existing database records will
         continue to work.
      =================================== */

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


      /* ===================================
         ACCOUNT STATUS

         true  -> Can access application
         false -> Login is blocked
      =================================== */

      isActive: {


        type:

          Boolean,


        default:

          true,


      },


    },


    {


      /* ===================================
         TIMESTAMPS

         createdAt
         updatedAt
      =================================== */

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


      /* =================================
         HASH ONLY WHEN PASSWORD CHANGES
      ================================= */

      if (


        !this.isModified(

          "password"

        )


      ) {


        return next();


      }


      /* =================================
         GENERATE SALT
      ================================= */

      const salt =


        await bcrypt.genSalt(


          10

        );


      /* =================================
         HASH PASSWORD
      ================================= */

      this.password =


        await bcrypt.hash(


          this.password,


          salt

        );


      /* =================================
         CONTINUE SAVE
      ================================= */

      return next();


    }

    catch (

      error

    ) {


      return next(

        error

      );


    }


  }

);


/* =========================================
   PASSWORD COMPARISON METHOD

   USED DURING LOGIN
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

   PREVENT MODEL RE-COMPILATION
========================================= */

const User =


  mongoose.models.User ||


  mongoose.model(


    "User",


    userSchema

  );


/* =========================================
   EXPORT USER MODEL
========================================= */

module.exports =

  User;