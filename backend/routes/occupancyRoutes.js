const express = require('express');

const router = express.Router();

const {
  checkIn,
  checkOut,
  getMyOccupancy,
  getAllOccupancies,
} = require('../controllers/occupancyController');

const {
  protect,
  requireRole,
} = require('../middleware/auth');


/* =========================================
   WALK-IN CHECK IN

   POST /api/occupancy/check-in
========================================= */

router.post(
  '/check-in',
  protect,
  checkIn
);


/* =========================================
   GET MY CURRENT WALK-IN SEAT

   GET /api/occupancy/me
========================================= */

router.get(
  '/me',
  protect,
  getMyOccupancy
);


/* =========================================
   WALK-IN CHECK OUT

   PATCH /api/occupancy/:id/check-out
========================================= */

router.patch(
  '/:id/check-out',
  protect,
  checkOut
);


/* =========================================
   ADMIN — GET ALL WALK-IN RECORDS

   GET /api/occupancy
========================================= */

router.get(
  '/',
  protect,
  requireRole('admin'),
  getAllOccupancies
);


module.exports = router;