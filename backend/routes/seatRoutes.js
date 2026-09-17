const express =
  require("express");


const router =
  express.Router();


const {

  getAllSeats,

  getAvailability,

  getLiveStatus,

  createSeat,

  updateSeat,

  deleteSeat,

} =
  require(
    "../controllers/seatController"
  );


const {

  protect,

  requireRole,

} =
  require(
    "../middleware/authMiddleware"
  );


/* =========================================
   IMPORTANT

   GET SEATS IS PROTECTED.

   The frontend must send:

   Authorization: Bearer <token>
========================================= */


/* =========================================
   GET ALL SEATS
========================================= */

router.get(
  "/",
  protect,
  getAllSeats
);


/* =========================================
   GET SEAT AVAILABILITY
========================================= */

router.get(
  "/availability",
  protect,
  getAvailability
);


/* =========================================
   GET LIVE STATUS
========================================= */

router.get(
  "/live-status",
  protect,
  getLiveStatus
);


/* =========================================
   CREATE SEAT
   ADMIN ONLY
========================================= */

router.post(
  "/",
  protect,
  requireRole(
    "admin"
  ),
  createSeat
);


/* =========================================
   UPDATE SEAT
   ADMIN ONLY
========================================= */

router.put(
  "/:id",
  protect,
  requireRole(
    "admin"
  ),
  updateSeat
);


/* =========================================
   DELETE SEAT
   ADMIN ONLY
========================================= */

router.delete(
  "/:id",
  protect,
  requireRole(
    "admin"
  ),
  deleteSeat
);


module.exports =
  router;