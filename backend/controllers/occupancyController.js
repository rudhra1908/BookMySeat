const Occupancy = require('../models/Occupancy');
const Seat = require('../models/Seat');


/* =========================================
   WALK-IN CHECK IN

   POST /api/occupancy/check-in
========================================= */

exports.checkIn = async (req, res) => {

  try {

    const { seatId } = req.body;


    if (!seatId) {

      return res.status(400).json({
        message: 'seatId is required',
      });

    }


    /* =====================================
       FIND SEAT
    ===================================== */

    const seat =
      await Seat.findById(seatId);


    if (!seat || !seat.isActive) {

      return res.status(404).json({
        message: 'Seat not found or unavailable',
      });

    }


    /* =====================================
       ONLY WALK-IN SEATS
    ===================================== */

    if (seat.seatType !== 'walkin') {

      return res.status(400).json({
        message:
          'This seat is reserved for online booking',
      });

    }


    /* =====================================
       CHECK IF SEAT IS AVAILABLE
    ===================================== */

    if (
      seat.occupancyStatus === 'occupied'
    ) {

      return res.status(400).json({
        message:
          'This seat is already occupied',
      });

    }


    /* =====================================
       CHECK IF SEAT ALREADY HAS
       AN ACTIVE OCCUPANCY RECORD
    ===================================== */

    const existingSeatOccupancy =
      await Occupancy.findOne({

        seat: seat._id,

        status: 'checked-in',

      });


    if (existingSeatOccupancy) {

      return res.status(400).json({
        message:
          'This seat is already occupied',
      });

    }


    /* =====================================
       CHECK IF USER ALREADY OCCUPIES
       ANOTHER WALK-IN SEAT
    ===================================== */

    const existingOccupancy =
      await Occupancy.findOne({

        student: req.user._id,

        status: 'checked-in',

      });


    if (existingOccupancy) {

      return res.status(400).json({
        message:
          'You are already checked in to another seat',
      });

    }


    /* =====================================
       CREATE OCCUPANCY RECORD
    ===================================== */

    const occupancy =
      await Occupancy.create({

        student: req.user._id,

        seat: seat._id,

        checkedInAt: new Date(),

        status: 'checked-in',

      });


    /* =====================================
       UPDATE SEAT STATUS
    ===================================== */

    seat.occupancyStatus = 'occupied';

    await seat.save();


    /* =====================================
       POPULATE STUDENT AND SEAT DETAILS
    ===================================== */

    await occupancy.populate(
      'student',
      'name email studentId'
    );

    await occupancy.populate(
      'seat',
      'seatNumber zone floor'
    );


    res.status(201).json({

      message:
        'Checked in successfully',

      occupancy,

    });

  } catch (err) {

    console.error(
      'Walk-in check-in error:',
      err
    );

    res.status(500).json({

      message:
        'Failed to check in',

      error:
        err.message,

    });

  }

};


/* =========================================
   WALK-IN CHECK OUT

   PATCH /api/occupancy/:id/check-out
========================================= */

exports.checkOut = async (req, res) => {

  try {

    const occupancy =
      await Occupancy.findById(
        req.params.id
      );


    if (!occupancy) {

      return res.status(404).json({
        message:
          'Check-in record not found',
      });

    }


    /* =====================================
       ONLY OWNER OR ADMIN CAN CHECK OUT
    ===================================== */

    const isOwner =
      occupancy.student.toString() ===
      req.user._id.toString();


    if (
      !isOwner &&
      req.user.role !== 'admin'
    ) {

      return res.status(403).json({
        message:
          'Not authorized to check out',
      });

    }


    /* =====================================
       ALREADY CHECKED OUT?
    ===================================== */

    if (
      occupancy.status !== 'checked-in'
    ) {

      return res.status(400).json({
        message:
          'This user is already checked out',
      });

    }


    /* =====================================
       UPDATE OCCUPANCY
    ===================================== */

    occupancy.status = 'checked-out';

    occupancy.checkedOutAt =
      new Date();

    await occupancy.save();


    /* =====================================
       FREE THE SEAT
    ===================================== */

    const seat =
      await Seat.findById(
        occupancy.seat
      );


    if (seat) {

      seat.occupancyStatus =
        'available';

      await seat.save();

    }


    /* =====================================
       POPULATE STUDENT AND SEAT DETAILS
    ===================================== */

    await occupancy.populate(
      'student',
      'name email studentId'
    );

    await occupancy.populate(
      'seat',
      'seatNumber zone floor'
    );


    res.json({

      message:
        'Checked out successfully',

      occupancy,

    });

  } catch (err) {

    console.error(
      'Walk-in check-out error:',
      err
    );

    res.status(500).json({

      message:
        'Failed to check out',

      error:
        err.message,

    });

  }

};


/* =========================================
   GET MY CURRENT OCCUPANCY

   GET /api/occupancy/me
========================================= */

exports.getMyOccupancy =
  async (req, res) => {

    try {

      const occupancy =
        await Occupancy.findOne({

          student: req.user._id,

          status: 'checked-in',

        })

          .populate(
            'seat',
            'seatNumber zone floor'
          );


      res.json({

        occupancy,

      });

    } catch (err) {

      res.status(500).json({

        message:
          'Failed to fetch occupancy',

        error:
          err.message,

      });

    }

  };


/* =========================================
   ADMIN — GET ALL OCCUPANCY RECORDS

   GET /api/occupancy
========================================= */

exports.getAllOccupancies =
  async (req, res) => {

    try {

      const occupancies =
        await Occupancy.find()

          .populate(
            'student',
            'name email studentId'
          )

          .populate(
            'seat',
            'seatNumber zone floor'
          )

          .sort({
            checkedInAt: -1,
          });


      res.json({

        occupancies,

      });

    } catch (err) {

      res.status(500).json({

        message:
          'Failed to fetch occupancy records',

        error:
          err.message,

      });

    }

  };