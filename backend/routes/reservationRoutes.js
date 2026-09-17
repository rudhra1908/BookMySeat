const express = require('express');

const router = express.Router();

const {
  createReservation,
  getMyReservations,
  cancelReservation,
  checkIn,
  completeReservation,
} = require('../controllers/reservationController');

const Reservation = require('../models/Reservation');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');


/* =========================================
   GET ALL RESERVATIONS
   ADMIN ONLY

   GET /api/reservations
========================================= */

router.get(
  '/',
  protect,
  requireRole('admin'),
  async (req, res) => {

    try {

      const reservations =
        await Reservation.find()

          .populate(
            'student',
            'name email studentId'
          )

          .populate(
            'seat',
            'seatNumber zone floor'
          )

          .sort({
            createdAt: -1,
          });


      return res.status(200).json({

        reservations,

      });

    } catch (error) {

      console.error(
        'Error fetching reservations:',
        error
      );


      return res.status(500).json({

        message:
          'Server error while fetching reservations',

      });

    }

  }
);


/* =========================================
   GET LOGGED-IN STUDENT RESERVATIONS

   GET /api/reservations/me
========================================= */

router.get(
  '/me',
  protect,
  getMyReservations
);


/* =========================================
   CREATE RESERVATION

   POST /api/reservations
========================================= */

router.post(
  '/',
  protect,
  createReservation
);


/* =========================================
   CANCEL RESERVATION

   DELETE /api/reservations/:id
========================================= */

router.delete(
  '/:id',
  protect,
  cancelReservation
);


/* =========================================
   CANCEL RESERVATION

   PUT /api/reservations/:id/cancel

   This matches your current App.jsx
========================================= */

router.put(
  '/:id/cancel',
  protect,
  cancelReservation
);


/* =========================================
   CHECK IN

   PATCH /api/reservations/:id/check-in
========================================= */

router.patch(
  '/:id/check-in',
  protect,
  checkIn
);


/* =========================================
   COMPLETE RESERVATION

   PATCH /api/reservations/:id/complete
========================================= */

router.patch(
  '/:id/complete',
  protect,
  completeReservation
);


module.exports = router;