import jwt from "jsonwebtoken";

import User from "../models/User.js";


/* =========================================
   AUTHENTICATION MIDDLEWARE
========================================= */


/* =========================================
   PROTECT MIDDLEWARE

   Verifies JWT token and attaches the
   authenticated user to:

   req.user

   This is a NAMED EXPORT because
   server.js imports:

   import {
     protect,
   } from "./middleware/authMiddleware.js";
========================================= */

export const protect = async (

  req,

  res,

  next

) => {


  try {


    /* =====================================
       GET AUTHORIZATION HEADER
    ===================================== */

    const authorizationHeader =

      req.headers.authorization;


    /* =====================================
       CHECK HEADER FORMAT

       Expected:

       Authorization: Bearer TOKEN
    ===================================== */

    if (

      !authorizationHeader ||

      !authorizationHeader.startsWith(

        "Bearer "

      )

    ) {


      return res.status(

        401

      ).json({

        message:

          "Authentication token is required.",

      });


    }


    /* =====================================
       EXTRACT TOKEN
    ===================================== */

    const token =

      authorizationHeader.split(

        " "

      )[1];


    /* =====================================
       CHECK TOKEN EXISTS
    ===================================== */

    if (

      !token

    ) {


      return res.status(

        401

      ).json({

        message:

          "Authentication token is required.",

      });


    }


    /* =====================================
       VERIFY JWT TOKEN
    ===================================== */

    const decodedToken =

      jwt.verify(

        token,

        process.env.JWT_SECRET

      );


    /* =====================================
       CHECK USER ID
    ===================================== */

    if (

      !decodedToken ||

      !decodedToken.id

    ) {


      return res.status(

        401

      ).json({

        message:

          "Invalid authentication token.",

      });


    }


    /* =====================================
       FIND USER

       Password is explicitly excluded.
    ===================================== */

    const user =

      await User.findById(

        decodedToken.id

      ).select(

        "-password"

      );


    /* =====================================
       CHECK USER EXISTS
    ===================================== */

    if (

      !user

    ) {


      return res.status(

        401

      ).json({

        message:

          "The user belonging to this token no longer exists.",

      });


    }


    /* =====================================
       CHECK ACCOUNT STATUS
    ===================================== */

    if (

      user.isActive === false

    ) {


      return res.status(

        403

      ).json({

        message:

          "Your account has been disabled. Please contact the administrator.",

      });


    }


    /* =====================================
       ATTACH USER TO REQUEST
    ===================================== */

    req.user =

      user;


    /* =====================================
       CONTINUE TO NEXT MIDDLEWARE
    ===================================== */

    return next();


  }

  catch (

    error

  ) {


    console.error(

      "Authentication middleware error:",

      error

    );


    /* =====================================
       JWT EXPIRED
    ===================================== */

    if (

      error.name ===

      "TokenExpiredError"

    ) {


      return res.status(

        401

      ).json({

        message:

          "Your login session has expired. Please log in again.",

        code:

          "TOKEN_EXPIRED",

      });


    }


    /* =====================================
       INVALID JWT
    ===================================== */

    if (

      error.name ===

      "JsonWebTokenError"

    ) {


      return res.status(

        401

      ).json({

        message:

          "Invalid authentication token.",

        code:

          "INVALID_TOKEN",

      });


    }


    /* =====================================
       GENERAL ERROR
    ===================================== */

    return res.status(

      500

    ).json({

      message:

        "Authentication failed.",

      error:

        error.message,

    });


  }


};


/* =========================================
   OPTIONAL DEFAULT EXPORT
========================================= */

export default protect;