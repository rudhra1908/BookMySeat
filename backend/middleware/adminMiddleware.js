/* =========================================
   ADMIN MIDDLEWARE
========================================= */


/* =========================================
   ADMIN ONLY MIDDLEWARE

   This middleware checks whether the
   authenticated user has admin access.

   This is a NAMED EXPORT because
   server.js imports it using:

   import {
     adminOnly,
   } from "./middleware/adminMiddleware.js";
========================================= */

export const adminOnly = (

  req,

  res,

  next

) => {


  try {


    /* =====================================
       CHECK AUTHENTICATED USER
    ===================================== */

    if (

      !req.user

    ) {


      return res.status(

        401

      ).json({

        message:

          "Authentication required. Please log in first.",

      });


    }


    /* =====================================
       CHECK ACCOUNT STATUS
    ===================================== */

    if (

      req.user.isActive === false

    ) {


      return res.status(

        403

      ).json({

        message:

          "Your account has been disabled. Please contact the administrator.",

      });


    }


    /* =====================================
       CHECK ADMIN ROLE
    ===================================== */

    if (

      req.user.role !== "admin"

    ) {


      return res.status(

        403

      ).json({

        message:

          "Access denied. Administrator privileges are required.",

      });


    }


    /* =====================================
       ADMIN ACCESS GRANTED
    ===================================== */

    return next();


  }

  catch (

    error

  ) {


    console.error(

      "Admin middleware error:",

      error

    );


    return res.status(

      500

    ).json({

      message:

        "Failed to verify administrator access.",

      error:

        error.message,

    });


  }


};


/* =========================================
   OPTIONAL DEFAULT EXPORT

   This allows the middleware to also work
   if another file imports it like:

   import adminOnly from "./adminMiddleware.js";
========================================= */

export default adminOnly;