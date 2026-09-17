const mongoose = require('mongoose');

const occupancySchema = new mongoose.Schema(
  {
    /* =====================================
       STUDENT WHO OCCUPIED THE SEAT
    ===================================== */

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },


    /* =====================================
       WALK-IN SEAT
    ===================================== */

    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
    },


    /* =====================================
       CHECK-IN TIME
    ===================================== */

    checkedInAt: {
      type: Date,
      required: true,
      default: Date.now,
    },


    /* =====================================
       CHECK-OUT TIME
    ===================================== */

    checkedOutAt: {
      type: Date,
      default: null,
    },


    /* =====================================
       OCCUPANCY STATUS
    ===================================== */

    status: {
      type: String,
      enum: [
        'checked-in',
        'checked-out',
      ],
      default: 'checked-in',
    },
  },

  {
    timestamps: true,
  }
);


/* =====================================
   INDEXES
===================================== */

occupancySchema.index({
  seat: 1,
  status: 1,
});


occupancySchema.index({
  student: 1,
  status: 1,
});


module.exports = mongoose.model(
  'Occupancy',
  occupancySchema
);