import {
  useEffect,
  useState,
} from "react";

import {
  QRCodeSVG,
} from "qrcode.react";

import "./BookingPass.css";


function BookingPass({

  reservation,

  onClose,

  onCheckIn,

  onCheckOut,

}) {


  const [
    currentTime,
    setCurrentTime,
  ] =
    useState(
      new Date()
    );


  /* =========================================
     LIVE CLOCK
  ========================================= */

  useEffect(

    () => {

      const timer =
        setInterval(

          () => {

            setCurrentTime(
              new Date()
            );

          },

          1000

        );


      return () => {

        clearInterval(
          timer
        );

      };

    },

    []

  );


  /* =========================================
     SAFETY CHECK
  ========================================= */

  if (
    !reservation ||
    typeof reservation !== "object"
  ) {

    return null;

  }


  /* =========================================
     RESERVATION ID
  ========================================= */

  const reservationId =

    reservation?._id ||

    reservation?.id ||

    "UNKNOWN";


  /* =========================================
     GET SEAT OBJECT SAFELY
  ========================================= */

  const seat =

    reservation?.seat &&
    typeof reservation.seat === "object"

      ? reservation.seat

      : {};


  /* =========================================
     GET SEAT NUMBER
  ========================================= */

  const seatNumber =

    seat?.seatNumber ||

    seat?.seatNo ||

    seat?.number ||

    seat?.name ||

    reservation?.seatNumber ||

    reservation?.seatNo ||

    (
      typeof reservation?.seat === "string"

        ? reservation.seat

        : null
    ) ||

    "N/A";


  /* =========================================
     GET FLOOR
  ========================================= */

  const rawFloor =

    seat?.floor ??

    seat?.floorNumber ??

    seat?.floorNo ??

    seat?.location?.floor ??

    reservation?.floor ??

    reservation?.floorNumber ??

    reservation?.floorNo ??

    "N/A";


  const floor =

    rawFloor === null ||
    rawFloor === undefined ||
    rawFloor === ""

      ? "N/A"

      : String(
          rawFloor
        );


  /* =========================================
     SAFE DATE OBJECTS
  ========================================= */

  const startTime =

    reservation?.startTime

      ? new Date(
          reservation.startTime
        )

      : null;


  const endTime =

    reservation?.endTime

      ? new Date(
          reservation.endTime
        )

      : null;


  const validStartTime =

    startTime &&

    !Number.isNaN(
      startTime.getTime()
    );


  const validEndTime =

    endTime &&

    !Number.isNaN(
      endTime.getTime()
    );


  /* =========================================
     CURRENT TIME STATUS
  ========================================= */

  const bookingNotStarted =

    validStartTime

      ? currentTime < startTime

      : false;


  const bookingActive =

    validStartTime &&
    validEndTime

      ? (

          currentTime >= startTime &&

          currentTime < endTime

        )

      : false;


  const bookingEnded =

    validEndTime

      ? currentTime >= endTime

      : false;


  /* =========================================
     REMAINING TIME
  ========================================= */

  const remainingMilliseconds =

    validEndTime

      ? Math.max(

          0,

          endTime.getTime() -

          currentTime.getTime()

        )

      : 0;


  const remainingMinutes =

    Math.max(

      0,

      Math.ceil(

        remainingMilliseconds /

        (1000 * 60)

      )

    );


  /* =========================================
     FORMAT DATE
  ========================================= */

  function formatDate(
    date
  ) {

    if (
      !date
    ) {

      return "N/A";

    }


    const parsedDate =
      new Date(
        date
      );


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "N/A";

    }


    return parsedDate.toLocaleDateString(

      "en-IN",

      {

        weekday:
          "long",

        year:
          "numeric",

        month:
          "long",

        day:
          "numeric",

      }

    );

  }


  /* =========================================
     FORMAT TIME
  ========================================= */

  function formatTime(
    date
  ) {

    if (
      !date
    ) {

      return "N/A";

    }


    const parsedDate =
      new Date(
        date
      );


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "N/A";

    }


    return parsedDate.toLocaleTimeString(

      "en-IN",

      {

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          true,

      }

    );

  }


  /* =========================================
     CALCULATE DURATION
  ========================================= */

  const durationHours =

    validStartTime &&
    validEndTime

      ? Math.max(

          0,

          Math.round(

            (

              endTime.getTime() -

              startTime.getTime()

            )

            /

            (1000 * 60 * 60)

          )

        )

      : 0;


  /* =========================================
     QR DATA
  ========================================= */

  const qrData =
    JSON.stringify({

      reservationId,

      seat:
        seatNumber,

      floor:
        floor,

      startTime:
        reservation?.startTime ||
        "N/A",

      endTime:
        reservation?.endTime ||
        "N/A",

      status:
        reservation?.status ||
        "unknown",

    });


  /* =========================================
     STATUS
  ========================================= */

  const reservationStatus =

    reservation?.status ||

    "booked";


  let statusText =
    "BOOKED";


  let statusClass =
    "booked";


  if (

    reservationStatus ===
    "checked-in"

    ||

    reservationStatus ===
    "checked_in"

  ) {

    statusText =
      "CHECKED IN";


    statusClass =
      "checked-in";

  }


  else if (

    reservationStatus ===
    "completed"

  ) {

    statusText =
      "COMPLETED";


    statusClass =
      "completed";

  }


  else if (

    reservationStatus ===
    "cancelled"

  ) {

    statusText =
      "CANCELLED";


    statusClass =
      "cancelled";

  }


  /* =========================================
     SAFE CHECK-IN
  ========================================= */

  function handleCheckInClick() {

    if (
      typeof onCheckIn === "function"
    ) {

      onCheckIn(
        reservationId
      );

    }

  }


  /* =========================================
     SAFE CHECK-OUT
  ========================================= */

  function handleCheckOutClick() {

    if (
      typeof onCheckOut === "function"
    ) {

      onCheckOut(
        reservationId
      );

    }

  }


  /* =========================================
     SAFE CLOSE
  ========================================= */

  function handleCloseClick() {

    if (
      typeof onClose === "function"
    ) {

      onClose();

    }

  }


  return (

    <div
      className="booking-pass-overlay"
      onClick={
        handleCloseClick
      }
    >


      <div
        className="booking-pass-container"
        onClick={
          (event) => {

            event.stopPropagation();

          }
        }
      >


        {/* =========================================
           CLOSE BUTTON
        ========================================= */}

        <button

          type="button"

          className="pass-close-btn"

          onClick={
            handleCloseClick
          }

        >

          ×

        </button>


        {/* =========================================
           PASS HEADER
        ========================================= */}

        <div className="pass-header">


          <div className="pass-brand">


            <div className="pass-logo">

              B

            </div>


            <div>


              <h2>

                BookMySeat

              </h2>


              <span>

                SMART LIBRARY

              </span>


            </div>


          </div>


          <div
            className={`pass-status ${statusClass}`}
          >


            <span></span>


            {statusText}


          </div>


        </div>


        {/* =========================================
           DIGITAL PASS TITLE
        ========================================= */}

        <div className="digital-pass-title">


          <div>


            <span>

              DIGITAL ACCESS PASS

            </span>


            <h1>

              Your Seat is Reserved

            </h1>


            <p>

              Show this pass while entering the library.

            </p>


          </div>


          <div className="pass-ticket-icon">

            🎫

          </div>


        </div>


        {/* =========================================
           MAIN CONTENT
        ========================================= */}

        <div className="pass-main-content">


          {/* =========================================
             LEFT SIDE
          ========================================= */}

          <div className="pass-details-section">


            {/* SEAT CARD */}

            <div className="pass-seat-card">


              <span>

                RESERVED SEAT

              </span>


              <div className="big-seat-number">

                {seatNumber}

              </div>


              <div className="seat-location">

                📍{" "}

                {floor === "N/A"

                  ? "Floor N/A"

                  : floor.toLowerCase().includes(
                      "floor"
                    )

                    ? floor

                    : `Floor ${floor}`
                }

              </div>


            </div>


            {/* =========================================
               BOOKING INFORMATION
            ========================================= */}

            <div className="pass-info-grid">


              <div className="pass-info-item">


                <span>

                  📅 DATE

                </span>


                <strong>

                  {formatDate(
                    reservation?.startTime
                  )}

                </strong>


              </div>


              <div className="pass-info-item">


                <span>

                  🕒 START TIME

                </span>


                <strong>

                  {formatTime(
                    reservation?.startTime
                  )}

                </strong>


              </div>


              <div className="pass-info-item">


                <span>

                  ⏳ END TIME

                </span>


                <strong>

                  {formatTime(
                    reservation?.endTime
                  )}

                </strong>


              </div>


              <div className="pass-info-item">


                <span>

                  ⏱ DURATION

                </span>


                <strong>

                  {durationHours > 0

                    ? `${durationHours} Hour${
                        durationHours > 1
                          ? "s"
                          : ""
                      }`

                    : "N/A"

                  }

                </strong>


              </div>


            </div>


            {/* =========================================
               LIVE STATUS
            ========================================= */}

            <div className="live-booking-status">


              {bookingNotStarted && (

                <>


                  <div className="status-icon">

                    ⏳

                  </div>


                  <div>


                    <strong>

                      Your booking has not started yet

                    </strong>


                    <p>

                      Your reserved time will begin at{" "}

                      {formatTime(
                        reservation?.startTime
                      )}

                      .

                    </p>


                  </div>


                </>

              )}


              {bookingActive && (

                <>


                  <div className="status-icon active-icon">

                    ●

                  </div>


                  <div>


                    <strong>

                      Booking is currently active

                    </strong>


                    <p>

                      {remainingMinutes <= 5

                        ? `Your booking ends in ${remainingMinutes} minute(s). Please check out soon.`

                        : `${remainingMinutes} minute(s) remaining in your booking.`

                      }

                    </p>


                  </div>


                </>

              )}


              {bookingEnded && (

                <>


                  <div className="status-icon">

                    ✓

                  </div>


                  <div>


                    <strong>

                      Booking slot completed

                    </strong>


                    <p>

                      This booking session has ended.

                    </p>


                  </div>


                </>

              )}


              {!bookingNotStarted &&
                !bookingActive &&
                !bookingEnded && (

                <>


                  <div className="status-icon">

                    ℹ

                  </div>


                  <div>


                    <strong>

                      Reservation information

                    </strong>


                    <p>

                      Your booking pass is ready.

                    </p>


                  </div>


                </>

              )}


            </div>


          </div>


          {/* =========================================
             QR SECTION
          ========================================= */}

          <div className="qr-section">


            <div className="qr-card">


              <div className="qr-header">


                <span>

                  SCAN TO VERIFY

                </span>


              </div>


              <div className="qr-wrapper">


                <QRCodeSVG

                  value={
                    qrData
                  }

                  size={
                    190
                  }

                  level={
                    "H"
                  }

                  includeMargin={
                    true
                  }

                />


              </div>


              <p>

                Scan this QR code at the library entrance.

              </p>


              <div className="reservation-id">


                <span>

                  RESERVATION ID

                </span>


                <strong>

                  {String(
                    reservationId
                  )

                    .slice(
                      -10
                    )

                    .toUpperCase()}

                </strong>


              </div>


            </div>


          </div>


        </div>


        {/* =========================================
           ACTION BUTTONS
        ========================================= */}

        <div className="pass-actions">


          {reservationStatus ===
            "booked" &&

            bookingActive && (

              <button

                type="button"

                className="checkin-pass-btn"

                onClick={
                  handleCheckInClick
                }

              >


                <span>

                  ✓

                </span>


                Check In


              </button>

            )}


          {(reservationStatus ===
            "checked-in"

            ||

            reservationStatus ===
            "checked_in"

          )

            &&

            bookingActive && (

              <button

                type="button"

                className="checkout-pass-btn"

                onClick={
                  handleCheckOutClick
                }

              >


                <span>

                  →

                </span>


                Check Out


              </button>

            )}


          <button

            type="button"

            className="close-pass-btn"

            onClick={
              handleCloseClick
            }

          >

            Close Pass

          </button>


        </div>


        {/* =========================================
           FOOTER
        ========================================= */}

        <div className="pass-footer">


          <span>

            ● LIVE DIGITAL PASS

          </span>


          <span>

            BookMySeat Smart Library System

          </span>


        </div>


      </div>


    </div>

  );

}


export default BookingPass;