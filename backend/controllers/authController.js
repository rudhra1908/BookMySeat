const jwt = require(

  "jsonwebtoken"

);


const User = require(

  "../models/User"

);


/* =========================================
   CREATE JWT TOKEN
========================================= */

const signToken = (

  user

) => {


  return jwt.sign(


    {

      id:

        user._id,


      role:

        user.role,


    },


    process.env.JWT_SECRET,


    {


      expiresIn:


        process.env.JWT_EXPIRES_IN ||

        "7d",


    }


  );


};


/* =========================================
   REMOVE PASSWORD FROM RESPONSE
========================================= */

const formatUser = (

  user

) => {


  const userObject =


    user.toObject

      ? user.toObject()

      : {

          ...user,

        };


  delete userObject.password;


  return userObject;

};


/* =========================================
   POST /api/auth/register

   PUBLIC REGISTRATION

   EVERY NEW ACCOUNT BECOMES:

   role: "user"

   ADMIN ROLE CANNOT BE CREATED THROUGH
   THE PUBLIC REGISTRATION PAGE.
========================================= */

exports.register = async (

  req,

  res

) => {

  try {


    const {


      name,


      email,


      password,


      studentId,


    } = req.body;


    /* =====================================
       VALIDATE REQUIRED FIELDS
    ===================================== */

    if (


      !name ||


      !email ||


      !password


    ) {


      return res.status(400).json({


        message:

          "Name, email and password are required",


      });


    }


    /* =====================================
       CHECK EXISTING USER
    ===================================== */

    const existingUser =


      await User.findOne({


        email:


          email

            .toLowerCase()

            .trim(),


      });


    if (


      existingUser


    ) {


      return res.status(409).json({


        message:

          "An account with this email already exists",


      });


    }


    /* =====================================
       CREATE NORMAL USER

       IMPORTANT:

       ROLE IS NOT ACCEPTED FROM req.body.
       OTHERWISE ANY USER COULD SEND:

       role: "admin"

       FROM THE FRONTEND.
    ===================================== */

    const user =


      await User.create({


        name:


          name

            .trim(),


        email:


          email

            .toLowerCase()

            .trim(),


        password,


        studentId:


          studentId

            ? studentId.trim()

            : "",


        role:

          "user",


        isActive:

          true,


      });


    /* =====================================
       GENERATE JWT TOKEN
    ===================================== */

    const token =

      signToken(

        user

      );


    /* =====================================
       RESPONSE
    ===================================== */

    return res.status(201).json({


      message:

        "Registration successful",


      user:


        formatUser(

          user

        ),


      token,


    });


  }

  catch (

    error

  ) {


    console.error(


      "Registration error:",


      error

    );


    return res.status(500).json({


      message:

        "Registration failed",


      error:

        error.message,


    });


  }


};


/* =========================================
   POST /api/auth/login

   SAME LOGIN API IS USED FOR:

   - STUDENT
   - NORMAL USER
   - ADMIN

   LOGIN TYPE IS ALSO RECEIVED FROM
   THE FRONTEND.

   EXAMPLES:

   loginType: "student"
   loginType: "admin"

   SECURITY:

   If student login is selected and the
   account is an admin -> access denied.

   If admin login is selected and the
   account is not an admin -> access denied.
========================================= */

exports.login = async (

  req,

  res

) => {

  try {


    const {


      email,


      password,


      loginType,


    } = req.body;


    /* =====================================
       VALIDATE REQUIRED FIELDS
    ===================================== */

    if (


      !email ||


      !password


    ) {


      return res.status(400).json({


        message:

          "Email and password are required",


      });


    }


    /* =====================================
       NORMALIZE LOGIN TYPE
    ===================================== */

    const selectedLoginType =


      loginType

        ? loginType

            .toLowerCase()

            .trim()

        : "student";


    /* =====================================
       FIND USER
    ===================================== */

    const user =


      await User.findOne({


        email:


          email

            .toLowerCase()

            .trim(),


      });


    /* =====================================
       USER NOT FOUND
    ===================================== */

    if (


      !user


    ) {


      return res.status(401).json({


        message:

          "Invalid email or password",


      });


    }


    /* =====================================
       CHECK ACCOUNT STATUS
    ===================================== */

    if (


      user.isActive === false


    ) {


      return res.status(403).json({


        message:

          "Your account has been disabled. Please contact the administrator.",


      });


    }


    /* =====================================
       CHECK PASSWORD
    ===================================== */

    const isPasswordCorrect =


      await user.comparePassword(


        password

      );


    if (


      !isPasswordCorrect


    ) {


      return res.status(401).json({


        message:

          "Invalid email or password",


      });


    }


    /* =====================================
       ADMIN LOGIN VALIDATION
    ===================================== */

    if (


      selectedLoginType === "admin" &&


      user.role !== "admin"


    ) {


      return res.status(403).json({


        message:

          "This account does not have administrator access.",


      });


    }


    /* =====================================
       STUDENT LOGIN VALIDATION

       An admin account must use the
       Admin Login option.
    ===================================== */

    if (


      selectedLoginType === "student" &&


      user.role === "admin"


    ) {


      return res.status(403).json({


        message:

          "Please select Admin Login to access this account.",


      });


    }


    /* =====================================
       GENERATE TOKEN
    ===================================== */

    const token =


      signToken(


        user

      );


    /* =====================================
       SUCCESS RESPONSE
    ===================================== */

    return res.status(200).json({


      message:

        "Login successful",


      user:


        formatUser(


          user

        ),


      token,


    });


  }

  catch (

    error

  ) {


    console.error(


      "Login error:",


      error

    );


    return res.status(500).json({


      message:

        "Login failed",


      error:

        error.message,


    });


  }


};


/* =========================================
   GET /api/auth/me

   GET CURRENT LOGGED-IN USER
========================================= */

exports.getMe = async (

  req,

  res

) => {

  try {


    if (


      !req.user


    ) {


      return res.status(401).json({


        message:

          "User authentication failed",


      });


    }


    return res.status(200).json({


      message:

        "Profile loaded successfully",


      user:


        formatUser(


          req.user

        ),


    });


  }

  catch (

    error

  ) {


    console.error(


      "Get profile error:",


      error

    );


    return res.status(500).json({


      message:

        "Failed to get user profile",


      error:

        error.message,


    });


  }


};