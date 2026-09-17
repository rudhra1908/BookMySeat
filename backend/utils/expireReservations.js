const Reservation = require('../models/Reservation');

/**
 * Finds every 'booked' reservation whose check-in deadline has passed
 * and marks it as expired.
 *
 * This function is safe to call repeatedly.
 */
async function expireOverdueReservations() {
  try {
    const now = new Date();

    const result = await Reservation.updateMany(
      {
        status: 'booked',

        checkInDeadline: {
          $lt: now,
        },
      },

      {
        $set: {
          status: 'expired',

          expiredAt: now,
        },
      }
    );

    return result.modifiedCount;

  } catch (error) {

    console.error(
      'Failed to expire overdue reservations:',
      error
    );

    throw error;

  }
}

module.exports = {
  expireOverdueReservations,
};