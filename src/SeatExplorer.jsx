import {
  useState,
  useEffect,
  useCallback,
} from "react";

import "./SeatExplorer.css";

import { api } from "./services/api";
import { useAuth } from "./AuthContext";


function SeatExplorer({
  goHome,
  bookingSuccess,
  reservations = [],
}) {


  /* =================================
     AUTH
  ================================= */

  const {
    token,
  } = useAuth();


  /* =================================
     BASIC STATES
  ================================= */

  const [
    selectedFloor,
    setSelectedFloor,
  ] = useState("Floor 1");


  const [
    selectedTime,
    setSelectedTime,
  ] = useState(null);


  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getTodayString()
  );


  const [
    selectedSeat,
    setSelectedSeat,
  ] = useState(null);


  /* =================================
     BOOKING PASS
  ================================= */

  const [
    bookedReservation,
    setBookedReservation,
  ] = useState(null);


  const [
    showBookingPass,
    setShowBookingPass,
  ] = useState(false);


  /* =================================
     BACKEND DATA STATES
  ================================= */

  const [
    seats,
    setSeats,
  ] = useState([]);


  const [
    availabilitySeats,
    setAvailabilitySeats,
  ] = useState([]);


  const [
    loadingSeats,
    setLoadingSeats,
  ] = useState(true);


  const [
    loadingAvailability,
    setLoadingAvailability,
  ] = useState(false);


  const [
    bookingLoading,
    setBookingLoading,
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /* =================================
     FLOOR DATA
  ================================= */

  const floors = [

    {
      name: "Floor 1",
      label: "Silent Study",
      icon: "01",
      value: 1,
    },

    {
      name: "Floor 2",
      label: "Collaborative",
      icon: "02",
      value: 2,
    },

    {
      name: "Floor 3",
      label: "Premium Zone",
      icon: "03",
      value: 3,
    },

  ];


  /* =================================
     TIME SLOTS
  ================================= */

  const timeSlots = [

    {
      value:
        "09:00 AM - 11:00 AM",

      short:
        "09:00",

      label:
        "Morning",
    },

    {
      value:
        "11:00 AM - 01:00 PM",

      short:
        "11:00",

      label:
        "Late Morning",
    },

    {
      value:
        "02:00 PM - 04:00 PM",

      short:
        "02:00",

      label:
        "Afternoon",
    },

    {
      value:
        "04:00 PM - 06:00 PM",

      short:
        "04:00",

      label:
        "Evening",
    },

  ];


  /* =================================
     CREATE FALLBACK SEATS
  ================================= */

  function createFallbackSeats(
    floorNumber
  ) {

    const generatedSeats = [];


    for (
      let seatNumber = 1;
      seatNumber <= 100;
      seatNumber++
    ) {

      generatedSeats.push({

        _id:
          `generated-F${floorNumber}-S${seatNumber}`,


        seatNumber:
          `F${floorNumber}-${String(
            seatNumber
          ).padStart(
            3,
            "0"
          )}`,


        floor:
          floorNumber,


        zone:

          floorNumber === 1

            ? "Silent Study"

            : floorNumber === 2

              ? "Collaborative"

              : "Premium Zone",


        seatType:
          "online",


        isActive:
          true,


        available:
          true,


        generated:
          true,

      });

    }


    return generatedSeats;

  }


  /* =================================
     LOAD ALL SEATS
  ================================= */

  const loadSeats =
    useCallback(
      async () => {

        try {

          setLoadingSeats(
            true
          );


          setErrorMessage(
            ""
          );


          if (!token) {

            setSeats(
              []
            );


            setErrorMessage(
              "Please log in before loading seats."
            );


            return;

          }


          const response =
            await api.getSeats(
              token
            );


          let backendSeats = [];


          if (
            Array.isArray(
              response
            )
          ) {

            backendSeats =
              response;

          }

          else if (
            Array.isArray(
              response?.seats
            )
          ) {

            backendSeats =
              response.seats;

          }

          else if (
            Array.isArray(
              response?.data
            )
          ) {

            backendSeats =
              response.data;

          }


          setSeats(
            backendSeats
          );

        }

        catch (
          error
        ) {

          console.error(
            "Failed to load seats:",
            error
          );


          setSeats(
            []
          );


          setErrorMessage(
            error?.message ||
            "Backend seats could not be loaded."
          );

        }

        finally {

          setLoadingSeats(
            false
          );

        }

      },
      [
        token,
      ]
    );


  /* =================================
     INITIAL LOAD
  ================================= */

  useEffect(
    () => {

      loadSeats();

    },
    [
      loadSeats,
    ]
  );


  /* =================================
     PARSE TIME
  ================================= */

  function parseTime(
    date,
    timeString
  ) {

    try {

      const match =
        timeString
          .trim()
          .match(
            /^(\d{1,2}):(\d{2})\s(AM|PM)$/i
          );


      if (!match) {

        return null;

      }


      let hours =
        Number(
          match[1]
        );


      const minutes =
        Number(
          match[2]
        );


      const period =
        match[3]
          .toUpperCase();


      if (
        period === "PM" &&
        hours !== 12
      ) {

        hours += 12;

      }


      if (
        period === "AM" &&
        hours === 12
      ) {

        hours = 0;

      }


      const [
        year,
        month,
        day,
      ] =
        date
          .split(
            "-"
          )
          .map(
            Number
          );


      return new Date(

        year,

        month - 1,

        day,

        hours,

        minutes,

        0,

        0

      );

    }

    catch {

      return null;

    }

  }


  /* =================================
     GET TIME RANGE
  ================================= */

  function getTimeRange(
    date,
    timeSlot
  ) {

    if (
      !date ||
      !timeSlot
    ) {

      return null;

    }


    const parts =
      timeSlot.split(
        "-"
      );


    if (
      parts.length !== 2
    ) {

      return null;

    }


    const startTime =
      parseTime(
        date,
        parts[0].trim()
      );


    const endTime =
      parseTime(
        date,
        parts[1].trim()
      );


    if (
      !startTime ||
      !endTime
    ) {

      return null;

    }


    return {

      startTime,

      endTime,

    };

  }


  /* =================================
     CHECK TIME SLOT AVAILABILITY

     DIGITAL BOOKING CLOSES
     5 MINUTES BEFORE START
  ================================= */

  function isTimeSlotUnavailable(
    timeSlot,
    date = selectedDate
  ) {

    if (
      !timeSlot ||
      !date
    ) {

      return true;

    }


    const today =
      getTodayString();


    if (
      date > today
    ) {

      return false;

    }


    if (
      date < today
    ) {

      return true;

    }


    const start =
      timeSlot
        .split(
          "-"
        )[0]
        .trim();


    const slotStart =
      parseTime(
        date,
        start
      );


    if (!slotStart) {

      return true;

    }


    /*
       CLOSE DIGITAL BOOKING
       5 MINUTES BEFORE SLOT
    */

    const bookingDeadline =
      new Date(
        slotStart.getTime() -
        5 * 60 * 1000
      );


    return (
      new Date() >=
      bookingDeadline
    );

  }


  /* =================================
     GET SELECTED FLOOR NUMBER
  ================================= */

  function getSelectedFloorNumber() {

    const floor =
      floors.find(
        (
          item
        ) =>
          item.name ===
          selectedFloor
      );


    return floor
      ? floor.value
      : 1;

  }


  /* =================================
     NORMALIZE FLOOR
  ================================= */

  function normalizeFloor(
    seat
  ) {

    if (!seat) {

      return null;

    }


    let floorValue =

      seat.floor ??

      seat.floorNumber ??

      seat.floorNo ??

      seat.floor_name ??

      seat.floorName;


    if (
      floorValue ===
      undefined ||

      floorValue ===
      null
    ) {

      return null;

    }


    if (
      typeof floorValue ===
      "object"
    ) {

      floorValue =

        floorValue.number ??

        floorValue.value ??

        floorValue.name;

    }


    const match =
      String(
        floorValue
      ).match(
        /\d+/
      );


    if (!match) {

      return null;

    }


    return Number(
      match[0]
    );

  }


  /* =================================
     LOAD AVAILABILITY
  ================================= */

  const loadAvailability =
    useCallback(
      async () => {

        if (
          !token ||
          !selectedDate ||
          !selectedTime
        ) {

          setAvailabilitySeats(
            []
          );


          return;

        }


        const range =
          getTimeRange(
            selectedDate,
            selectedTime
          );


        if (!range) {

          setAvailabilitySeats(
            []
          );


          return;

        }


        try {

          setLoadingAvailability(
            true
          );


          /*
             IMPORTANT

             api.js expects:

             getSeatAvailability(
               startTime,
               endTime,
               token
             )
          */

          const response =
            await api.getSeatAvailability(

              range.startTime
                .toISOString(),

              range.endTime
                .toISOString(),

              token

            );


          let backendSeats = [];


          if (
            Array.isArray(
              response
            )
          ) {

            backendSeats =
              response;

          }

          else if (
            Array.isArray(
              response?.seats
            )
          ) {

            backendSeats =
              response.seats;

          }

          else if (
            Array.isArray(
              response?.data
            )
          ) {

            backendSeats =
              response.data;

          }


          setAvailabilitySeats(
            backendSeats
          );

        }

        catch (
          error
        ) {

          console.error(
            "Availability error:",
            error
          );


          setAvailabilitySeats(
            []
          );

        }

        finally {

          setLoadingAvailability(
            false
          );

        }

      },
      [

        token,

        selectedDate,

        selectedTime,

      ]
    );


  useEffect(
    () => {

      loadAvailability();

    },
    [
      loadAvailability,
    ]
  );


  /* =================================
     GET SEAT ID
  ================================= */

  function getSeatId(
    seat
  ) {

    if (!seat) {

      return null;

    }


    if (
      typeof seat ===
      "string"
    ) {

      return seat;

    }


    return (

      seat._id ||

      seat.id ||

      seat.seatId ||

      seat.seat_id ||

      null

    );

  }


  /* =================================
     GET SEAT NAME
  ================================= */

  function getSeatName(
    seat
  ) {

    if (!seat) {

      return "Seat";

    }


    if (
      typeof seat ===
      "string"
    ) {

      return seat;

    }


    return (

      seat?.seatNumber ||

      seat?.seatNo ||

      seat?.number ||

      seat?.name ||

      seat?.id ||

      "Seat"

    );

  }


  /* =================================
     GET SEAT TYPE
  ================================= */

  function getSeatType(
    seat
  ) {

    const seatType =
      String(

        seat?.seatType ??

        seat?.bookingType ??

        seat?.type ??

        ""

      )
        .trim()
        .toLowerCase();


    if (

      seatType === "walkin" ||

      seatType === "walk-in" ||

      seatType === "offline" ||

      seatType === "physical"

    ) {

      return "Blocked / Walk-in Only";

    }


    return (

      seat?.zone ||

      seat?.category ||

      seat?.type ||

      "Library Seat"

    );

  }


  /* =================================
     PHYSICAL / OFFLINE SEAT
  ================================= */

  function isPhysicalOrOfflineSeat(
    seat
  ) {

    if (!seat) {

      return false;

    }


    const values = [

      seat.seatType,

      seat.bookingType,

      seat.type,

      seat.category,

      seat.mode,

      seat.reservationType,

    ];


    const normalizedValues =
      values

        .filter(
          (
            value
          ) =>

            value !== undefined &&

            value !== null
        )

        .map(
          (
            value
          ) =>

            String(
              value
            )

              .trim()

              .toLowerCase()
        );


    const blockedTypes = [

      "walkin",

      "walk-in",

      "walk in",

      "offline",

      "physical",

      "physical-only",

      "offline-only",

      "walkin-only",

      "walk-in-only",

      "blocked",

      "unavailable",

    ];


    return normalizedValues.some(
      (
        value
      ) =>

        blockedTypes.includes(
          value
        )

    );

  }


  /* =================================
     CURRENT FLOOR SEATS
  ================================= */

  const currentFloorNumber =
    getSelectedFloorNumber();


  const backendFloorSeats =
    seats.filter(
      (
        seat
      ) =>

        normalizeFloor(
          seat
        ) ===
        currentFloorNumber
    );


  let displayedSeats = [];


  if (
    backendFloorSeats.length >=
    100
  ) {

    displayedSeats =
      backendFloorSeats.slice(
        0,
        100
      );

  }

  else if (
    backendFloorSeats.length > 0
  ) {

    const generatedSeats =
      createFallbackSeats(
        currentFloorNumber
      );


    displayedSeats = [

      ...backendFloorSeats,

      ...generatedSeats,

    ];

  }

  else {

    displayedSeats =
      createFallbackSeats(
        currentFloorNumber
      );

  }


  /*
     REMOVE DUPLICATES
  */

  displayedSeats =
    displayedSeats
      .filter(
        (
          seat,
          index,
          array
        ) => {

          const seatName =
            getSeatName(
              seat
            );


          return (

            array.findIndex(
              (
                item
              ) =>

                getSeatName(
                  item
                ) ===
                seatName

            ) === index

          );

        }
      )
      .slice(
        0,
        100
      );


  /* =================================
     CHECK BOOKED SEAT
  ================================= */

  function isSeatBooked(
    seat
  ) {

    if (!selectedTime) {

      return false;

    }


    const seatId =
      getSeatId(
        seat
      );


    const seatName =
      getSeatName(
        seat
      );


    const backendSeat =
      availabilitySeats.find(
        (
          availabilitySeat
        ) => {

          const availabilityId =
            getSeatId(
              availabilitySeat
            );


          const availabilityName =
            getSeatName(
              availabilitySeat
            );


          return (

            String(
              availabilityId
            ) ===
            String(
              seatId
            )

            ||

            String(
              availabilityName
            ) ===
            String(
              seatName
            )

          );

        }
      );


    if (
      backendSeat
    ) {

      const status =
        String(
          backendSeat.status ||
          ""
        )

          .trim()

          .toLowerCase();


      if (

        backendSeat.available === false ||

        backendSeat.isAvailable === false ||

        [

          "booked",

          "reserved",

          "occupied",

          "unavailable",

          "blocked",

        ].includes(
          status
        )

      ) {

        return true;

      }

    }


    return reservations.some(
      (
        reservation
      ) => {

        const reservationStatus =
          String(
            reservation.status ||
            ""
          )
            .trim()
            .toLowerCase();


        if (

          reservationStatus ===
          "cancelled" ||

          reservationStatus ===
          "canceled" ||

          reservationStatus ===
          "completed" ||

          reservationStatus ===
          "expired"

        ) {

          return false;

        }


        const reservationSeat =

          typeof reservation.seat ===
          "object"

            ? reservation.seat

            : {

                _id:

                  reservation.seat ||

                  reservation.seatId,

                seatNumber:

                  reservation.seatNumber,

              };


        const reservationSeatId =
          getSeatId(
            reservationSeat
          );


        const reservationSeatName =
          getSeatName(
            reservationSeat
          );


        return (

          String(
            reservationSeatId
          ) ===
          String(
            seatId
          )

          ||

          String(
            reservationSeatName
          ) ===
          String(
            seatName
          )

        );

      }
    );

  }


  /* =================================
     CHECK INACTIVE
  ================================= */

  function isSeatInactive(
    seat
  ) {

    const status =
      String(
        seat?.status ||
        ""
      )

        .trim()

        .toLowerCase();


    return (

      seat?.isActive === false ||

      seat?.active === false ||

      status === "inactive" ||

      status === "disabled"

    );

  }


  /* =================================
     CHECK UNAVAILABLE
  ================================= */

  function isSeatUnavailable(
    seat
  ) {

    if (!selectedTime) {

      return true;

    }


    if (
      isPhysicalOrOfflineSeat(
        seat
      )
    ) {

      return true;

    }


    if (
      isSeatInactive(
        seat
      )
    ) {

      return true;

    }


    if (
      !seat.generated &&
      (
        seat.available === false ||
        seat.isAvailable === false
      )
    ) {

      return true;

    }


    if (
      isSeatBooked(
        seat
      )
    ) {

      return true;

    }


    return false;

  }


  /* =================================
     AVAILABLE COUNT
  ================================= */

  const availableSeats =
    selectedTime

      ? displayedSeats.filter(
          (
            seat
          ) =>

            !isSeatUnavailable(
              seat
            )
        ).length

      : 0;


  const bookedSeats =
    selectedTime

      ? displayedSeats.length -
        availableSeats

      : 0;


  /* =================================
     FLOOR CHANGE
  ================================= */

  function handleFloorChange(
    floor
  ) {

    setSelectedFloor(
      floor
    );


    setSelectedSeat(
      null
    );

  }


  /* =================================
     TIME CHANGE
  ================================= */

  function handleTimeChange(
    time
  ) {

    if (
      isTimeSlotUnavailable(
        time,
        selectedDate
      )
    ) {

      return;

    }


    setSelectedTime(
      time
    );


    setSelectedSeat(
      null
    );

  }


  /* =================================
     DATE CHANGE
  ================================= */

  function handleDateChange(
    date
  ) {

    setSelectedDate(
      date
    );


    setSelectedSeat(
      null
    );


    if (

      selectedTime &&

      isTimeSlotUnavailable(
        selectedTime,
        date
      )

    ) {

      setSelectedTime(
        null
      );

    }

  }


  /* =================================
     CONFIRM BOOKING
  ================================= */

  async function handleConfirmBooking() {

    if (!selectedTime) {

      alert(
        "Please select an available time slot."
      );


      return;

    }


    if (!selectedSeat) {

      alert(
        "Please select a seat first."
      );


      return;

    }


    if (
      selectedSeat.generated
    ) {

      alert(
        "This seat is currently not available in the database."
      );


      return;

    }


    if (
      isPhysicalOrOfflineSeat(
        selectedSeat
      )
    ) {

      alert(
        "This seat is reserved for physical or offline booking only."
      );


      return;

    }


    if (
      isTimeSlotUnavailable(
        selectedTime,
        selectedDate
      )
    ) {

      alert(
        "Online booking is closed. Reservations must be made at least 5 minutes before the slot starts."
      );


      return;

    }


    const seatId =
      getSeatId(
        selectedSeat
      );


    if (!seatId) {

      alert(
        "Invalid seat selected."
      );


      return;

    }


    const range =
      getTimeRange(
        selectedDate,
        selectedTime
      );


    if (!range) {

      alert(
        "Invalid time slot."
      );


      return;

    }


    try {

      setBookingLoading(
        true
      );


      const response =
        await api.createReservation(

          {

            seatId,

            startTime:
              range.startTime
                .toISOString(),

            endTime:
              range.endTime
                .toISOString(),

          },

          token

        );


      const createdReservation =

        response?.reservation ||

        response;


      const completeReservation = {

        ...createdReservation,

        seat:

          createdReservation?.seat ||

          selectedSeat,


        selectedSeat:

          selectedSeat,


        selectedFloor:

          selectedFloor,


        selectedDate:

          selectedDate,


        selectedTime:

          selectedTime,


        floor:

          createdReservation?.floor ||

          selectedFloor,


        date:

          createdReservation?.date ||

          selectedDate,


        time:

          createdReservation?.time ||

          selectedTime,


        status:

          createdReservation?.status ||

          "Booked",

      };


      setBookedReservation(
        completeReservation
      );


      setShowBookingPass(
        true
      );


      if (
        bookingSuccess
      ) {

        bookingSuccess(
          completeReservation
        );

      }


      setSelectedSeat(
        null
      );


      await loadAvailability();

    }

    catch (
      error
    ) {

      console.error(
        "Reservation error:",
        error
      );


      alert(

        error?.message ||

        "Failed to create reservation"

      );

    }

    finally {

      setBookingLoading(
        false
      );

    }

  }


  /* =================================
     FORMAT DATE
  ================================= */

  function formatDate(
    date
  ) {

    if (!date) {

      return "";

    }


    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-US",
      {

        weekday:
          "short",

        month:
          "short",

        day:
          "numeric",

        year:
          "numeric",

      }
    );

  }


  /* =================================
     BOOKING PASS HELPERS
  ================================= */

  function getPassSeat() {

    if (!bookedReservation) {

      return null;

    }


    if (
      bookedReservation.selectedSeat
    ) {

      return bookedReservation.selectedSeat;

    }


    if (
      typeof bookedReservation.seat ===
      "object"
    ) {

      return bookedReservation.seat;

    }


    return {

      seatNumber:

        bookedReservation.seat ||

        bookedReservation.seatNumber ||

        "Seat",

    };

  }


  function getReservationId() {

    return (

      bookedReservation?._id ||

      bookedReservation?.id ||

      bookedReservation?.reservationId ||

      "BOOKING"

    );

  }


  function createQrData() {

    if (!bookedReservation) {

      return "";

    }


    const passSeat =
      getPassSeat();


    return JSON.stringify({

      bookingId:
        getReservationId(),

      seat:
        getSeatName(
          passSeat
        ),

      floor:
        bookedReservation.selectedFloor ||
        selectedFloor,

      date:
        bookedReservation.selectedDate ||
        selectedDate,

      time:
        bookedReservation.selectedTime ||
        selectedTime,

      status:
        bookedReservation.status ||
        "Booked",

    });

  }


  /* =================================
     RENDER
  ================================= */

  return (

    <div className="seat-explorer-page">

      <div className="explorer-grid"></div>

      <div className="explorer-orb orb-left"></div>

      <div className="explorer-orb orb-right"></div>


      {/* =================================
          BOOKING PASS MODAL
      ================================= */}

      {showBookingPass &&
        bookedReservation && (

        <div className="booking-pass-overlay">

          <div className="booking-pass-modal">


            {/* CLOSE */}

            <button
              className="pass-close-btn"
              onClick={() =>

                setShowBookingPass(
                  false
                )

              }
            >

              ×

            </button>


            {/* HEADER */}

            <div className="pass-header">

              <div className="pass-brand">

                <div className="pass-brand-icon">

                  B

                </div>


                <div>

                  <strong>

                    BookMySeat

                  </strong>


                  <span>

                    SMART LIBRARY

                  </span>

                </div>

              </div>


              <div className="pass-success-badge">

                ✓ CONFIRMED

              </div>

            </div>


            {/* PASS HERO */}

            <div className="pass-hero">

              <div>

                <span className="pass-label">

                  DIGITAL ENTRY PASS

                </span>


                <h2>

                  Your seat is

                  <span>

                    {" "}
                    reserved!

                  </span>

                </h2>


                <p>

                  Show this QR pass at the library
                  entrance or during verification.

                </p>

              </div>


              <div className="pass-seat-display">

                <span>

                  SEAT

                </span>


                <strong>

                  {getSeatName(
                    getPassSeat()
                  )}

                </strong>

              </div>

            </div>


            {/* PASS CONTENT */}

            <div className="pass-content">


              {/* QR */}

              <div className="pass-qr-section">

                <div className="qr-wrapper">

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      createQrData()
                    )}`}
                    alt="Booking QR Code"
                  />

                </div>


                <span>

                  Scan for verification

                </span>


                <small>

                  Valid only for this booking

                </small>

              </div>


              {/* DETAILS */}

              <div className="pass-details">

                <div className="pass-detail-card">

                  <span>

                    📅 DATE

                  </span>


                  <strong>

                    {formatDate(

                      bookedReservation.selectedDate ||
                      selectedDate

                    )}

                  </strong>

                </div>


                <div className="pass-detail-card">

                  <span>

                    🕒 TIME SLOT

                  </span>


                  <strong>

                    {

                      bookedReservation.selectedTime ||
                      selectedTime

                    }

                  </strong>

                </div>


                <div className="pass-detail-card">

                  <span>

                    📍 FLOOR

                  </span>


                  <strong>

                    {

                      bookedReservation.selectedFloor ||
                      selectedFloor

                    }

                  </strong>

                </div>


                <div className="pass-detail-card">

                  <span>

                    🪑 ZONE

                  </span>


                  <strong>

                    {getSeatType(
                      getPassSeat()
                    )}

                  </strong>

                </div>


                <div className="pass-detail-card booking-id-card">

                  <span>

                    BOOKING ID

                  </span>


                  <strong>

                    {getReservationId()}

                  </strong>

                </div>

              </div>

            </div>


            {/* INSTRUCTIONS */}

            <div className="pass-instructions">

              <div className="instruction-icon">

                ℹ

              </div>


              <div>

                <strong>

                  Important Instructions

                </strong>


                <p>

                  Please arrive on time and check in
                  after your booking slot starts.
                  You will receive a reminder before
                  your reservation ends. If you do not
                  check out, the system will
                  automatically complete your booking
                  when the slot ends.

                </p>

              </div>

            </div>


            {/* FOOTER */}

            <div className="pass-footer">

              <div>

                <span>

                  RESERVATION STATUS

                </span>


                <strong>

                  ● BOOKED

                </strong>

              </div>


              <button
                className="pass-done-btn"
                onClick={() => {

                  setShowBookingPass(
                    false
                  );


                  if (
                    bookingSuccess
                  ) {

                    bookingSuccess(
                      bookedReservation
                    );

                  }

                }}
              >

                View My Reservations

                <span>

                  →

                </span>

              </button>

            </div>

          </div>

        </div>

      )}


      {/* NAVBAR */}

      <nav className="seat-nav">

        <button
          className="seat-brand"
          onClick={goHome}
        >

          <div className="brand-icon">

            B

          </div>


          <div className="seat-brand-text">

            <strong>

              BookMySeat

            </strong>


            <small>

              SMART LIBRARY

            </small>

          </div>

        </button>


        <div className="seat-nav-right">

          <div className="availability-pill">

            <span className="live-dot"></span>

            {!selectedTime

              ? "Select a time"

              : loadingAvailability

                ? "Loading..."

                : `${availableSeats} seats available`

            }

          </div>


          <button
            className="back-home-btn"
            onClick={goHome}
          >

            <span>

              ←

            </span>

            Back to Dashboard

          </button>

        </div>

      </nav>


      <main className="seat-container">


        {/* HEADER */}

        <header className="explorer-header">

          <div className="explorer-title">

            <div className="page-tag">

              <span className="tag-line"></span>

              SEAT EXPLORER

            </div>


            <h1>

              Choose your

              <span>

                {" "}
                perfect spot.

              </span>

            </h1>


            <p>

              Customize your study session and reserve
              the space that works best for you.

            </p>

          </div>

        </header>


        {/* ERROR */}

        {errorMessage && (

          <div
            style={{

              marginBottom:
                "20px",

              padding:
                "12px 16px",

              borderRadius:
                "8px",

              fontSize:
                "14px",

              border:
                "1px solid #ff8a8a",

            }}
          >

            {errorMessage}

          </div>

        )}


        {/* CONTROL PANEL */}

        <section className="booking-control-panel">


          {/* DATE */}

          <div className="control-block date-control">

            <div className="control-heading">

              <div className="control-number">

                01

              </div>


              <div>

                <span>

                  STEP ONE

                </span>


                <h3>

                  Select Date

                </h3>

              </div>

            </div>


            <div className="date-picker-wrap">

              <input
                type="date"
                value={selectedDate}
                min={getTodayString()}
                onChange={(event) =>

                  handleDateChange(
                    event.target.value
                  )

                }
                className="date-input"
              />

            </div>

          </div>


          {/* FLOOR */}

          <div className="control-block floor-control">

            <div className="control-heading">

              <div className="control-number">

                02

              </div>


              <div>

                <span>

                  STEP TWO

                </span>


                <h3>

                  Choose Floor

                </h3>

              </div>

            </div>


            <div className="floor-options">

              {floors.map(
                (
                  floor
                ) => (

                  <button
                    key={floor.name}
                    className={`floor-card ${
                      selectedFloor ===
                      floor.name

                        ? "active-floor"

                        : ""
                    }`}
                    onClick={() =>

                      handleFloorChange(
                        floor.name
                      )

                    }
                  >

                    <strong>

                      {floor.icon}

                    </strong>


                    <div>

                      <span>

                        {floor.name}

                      </span>


                      <small>

                        {floor.label}

                      </small>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>


          {/* TIME */}

          <div className="control-block time-control">

            <div className="control-heading">

              <div className="control-number">

                03

              </div>


              <div>

                <span>

                  STEP THREE

                </span>


                <h3>

                  Choose Time

                </h3>

              </div>

            </div>


            <div className="time-options">

              {timeSlots.map(
                (
                  time
                ) => {

                  const unavailable =
                    isTimeSlotUnavailable(
                      time.value,
                      selectedDate
                    );


                  return (

                    <button
                      key={time.value}
                      disabled={unavailable}
                      className={`time-card ${
                        selectedTime ===
                        time.value

                          ? "active-time"

                          : ""

                      } ${
                        unavailable

                          ? "disabled-time"

                          : ""

                      }`}
                      onClick={() =>

                        handleTimeChange(
                          time.value
                        )

                      }
                    >

                      <strong>

                        {time.short}

                      </strong>


                      <span>

                        {unavailable

                          ? "Booking Closed"

                          : time.label

                        }

                      </span>

                    </button>

                  );

                }
              )}

            </div>

          </div>

        </section>


        {/* SEAT SECTION */}

        <section className="seat-selection-area">

          <div className="seat-selection-header">

            <div>

              <div className="section-kicker">

                <span className="control-number">

                  04

                </span>


                <span>

                  FINAL STEP

                </span>

              </div>


              <h2>

                Select your seat

              </h2>


              <p>

                Showing {displayedSeats.length}

                {" "}seats on{" "}

                {selectedFloor}

              </p>

            </div>


            <div className="seat-legend modern-legend">

              <div>

                <span className="legend-dot available"></span>

                Available

              </div>


              <div>

                <span className="legend-dot occupied"></span>

                Reserved / Blocked

              </div>


              <div>

                <span className="legend-dot selected"></span>

                Selected

              </div>

            </div>

          </div>


          {/* LIBRARY MAP */}

          <div className="library-map-card">

            <div className="map-top-bar">

              <span>

                {selectedFloor}

              </span>


              <div className="map-status">

                <span className="live-dot"></span>

                LIVE MAP

              </div>

            </div>


            <div className="library-layout">

              <div className="window-side">

                <span>

                  WINDOW SIDE

                </span>

              </div>


              <div className="seats-grid">

                {loadingSeats ? (

                  <div
                    style={{

                      gridColumn:
                        "1 / -1",

                      textAlign:
                        "center",

                      padding:
                        "30px",

                    }}
                  >

                    Loading seats...

                  </div>

                ) : (

                  displayedSeats.map(
                    (
                      seat,
                      index
                    ) => {

                      const seatId =
                        getSeatId(
                          seat
                        ) ||
                        `seat-${index}`;


                      const unavailable =
                        isSeatUnavailable(
                          seat
                        );


                      const selectedSeatId =
                        getSeatId(
                          selectedSeat
                        );


                      const isSelected =

                        String(
                          selectedSeatId
                        ) ===

                        String(
                          seatId
                        );


                      const isPhysicalSeat =
                        isPhysicalOrOfflineSeat(
                          seat
                        );


                      return (

                        <button
                          key={seatId}
                          disabled={unavailable}
                          onClick={() => {

                            if (
                              !unavailable
                            ) {

                              setSelectedSeat(
                                seat
                              );

                            }

                          }}
                          className={`seat-box ${
                            unavailable

                              ? "occupied"

                              : "available"

                          } ${
                            isSelected

                              ? "selected-seat"

                              : ""

                          } ${
                            isPhysicalSeat

                              ? "blocked-seat"

                              : ""

                          }`}
                          title={

                            isPhysicalSeat

                              ? "This seat is reserved for physical or offline booking only"

                              : unavailable

                                ? "This seat is unavailable"

                                : "Available for booking"

                          }
                        >

                          <span className="seat-chair">

                            ♟

                          </span>


                          <strong>

                            {getSeatName(
                              seat
                            )}

                          </strong>


                          <small>

                            {isPhysicalSeat

                              ? "BLOCKED"

                              : getSeatType(
                                  seat
                                )

                            }

                          </small>

                        </button>

                      );

                    }
                  )

                )}

              </div>


              <div className="entrance-label">

                ↓ ENTRANCE

              </div>

            </div>


            <div className="map-footer">

              <div>

                <span className="map-count available-count">

                  {availableSeats}

                </span>

                Available

              </div>


              <div>

                <span className="map-count reserved-count">

                  {bookedSeats}

                </span>

                Reserved / Blocked

              </div>


              <div>

                <span className="map-count total-count">

                  {displayedSeats.length}

                </span>

                Total

              </div>

            </div>

          </div>

        </section>


        {/* BOOKING SUMMARY */}

        <section
          className={`selected-seat-summary ${
            selectedSeat

              ? "summary-visible"

              : "summary-empty"

          }`}
        >

          {selectedSeat ? (

            <>

              <div className="summary-seat-main">

                <span>

                  YOUR SELECTED SEAT

                </span>


                <div className="summary-seat-number">

                  {getSeatName(
                    selectedSeat
                  )}

                </div>


                <p>

                  {getSeatType(
                    selectedSeat
                  )}

                </p>

              </div>


              <div className="summary-details">

                <div className="summary-detail">

                  <span>

                    DATE

                  </span>


                  <strong>

                    {formatDate(
                      selectedDate
                    )}

                  </strong>

                </div>


                <div className="summary-detail">

                  <span>

                    TIME SLOT

                  </span>


                  <strong>

                    {selectedTime}

                  </strong>

                </div>


                <div className="summary-detail">

                  <span>

                    LOCATION

                  </span>


                  <strong>

                    {selectedFloor}

                  </strong>

                </div>

              </div>


              <button
                className="confirm-btn"
                disabled={bookingLoading}
                onClick={handleConfirmBooking}
              >

                <span>

                  {bookingLoading

                    ? "Creating Reservation..."

                    : "Confirm Reservation"

                  }

                </span>


                <strong>

                  →

                </strong>

              </button>

            </>

          ) : (

            <div className="empty-summary">

              <div className="empty-seat-icon">

                ♙

              </div>


              <div>

                <strong>

                  {!selectedTime

                    ? "Select a time slot first"

                    : "No seat selected yet"

                  }

                </strong>


                <p>

                  {!selectedTime

                    ? "Choose an available time slot to see available seats."

                    : "Select an available seat from the library map to continue."

                  }

                </p>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>

  );

}


/* =================================
   GET TODAY DATE
================================= */

function getTodayString() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


export default SeatExplorer;