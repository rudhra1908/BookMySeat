import {
  QRCodeSVG,
} from "qrcode.react";

import "./BookingSuccess.css";


function BookingSuccess({

  booking,

  goHome,

  bookAnother,

  viewReservations,

}) {


  /* =========================================
     SAFETY CHECK
  ========================================= */

  if (
    !booking ||
    typeof booking !== "object"
  ) {

    return (

      <div className="booking-success-page">

        <div className="success-grid"></div>

        <main className="booking-success-container">

          <section className="booking-success-header">

            <div className="success-icon success-cancelled">

              <div className="checkmark">
                !
              </div>

            </div>


            <p className="success-label">
              BOOKING NOT AVAILABLE
            </p>


            <h1>

              Booking details{" "}

              <span>
                not found.
              </span>

            </h1>


            <p className="success-description">

              We could not load your reservation
              details. Please check your reservations.

            </p>


            <div className="success-actions">

              <button
                type="button"
                className="success-outline-btn"
                onClick={viewReservations}
              >

                <span>
                  ▦
                </span>

                My Reservations

              </button>


              <button
                type="button"
                className="success-home-btn"
                onClick={goHome}
              >

                Back to home

                <strong>
                  →
                </strong>

              </button>

            </div>

          </section>

        </main>

      </div>

    );

  }


  /* =========================================
     RESERVATION ID
  ========================================= */

  const rawReservationId =

    booking?.reservationId ||

    booking?._id ||

    booking?.id ||

    "UNKNOWN";


  const reservationShortId =

    String(
      rawReservationId
    )
      .slice(
        -10
      )
      .toUpperCase();


  const passId =

    `BMS-${reservationShortId}`;


  /* =========================================
     STATUS
  ========================================= */

  const bookingStatus =

    booking?.status ||

    "booked";


  const normalizedStatus =

    String(
      bookingStatus
    )
      .toLowerCase()
      .trim();


  const isCancelled =

    normalizedStatus === "cancelled" ||

    normalizedStatus === "canceled";


  const isConfirmed =

    normalizedStatus === "confirmed" ||

    normalizedStatus === "booked" ||

    normalizedStatus === "active" ||

    normalizedStatus === "checked-in" ||

    normalizedStatus === "checked_in";


  let displayStatus =

    "BOOKED";


  if (
    normalizedStatus === "confirmed"
  ) {

    displayStatus =
      "CONFIRMED";

  }


  if (
    normalizedStatus === "checked-in" ||
    normalizedStatus === "checked_in"
  ) {

    displayStatus =
      "CHECKED IN";

  }


  if (
    normalizedStatus === "completed"
  ) {

    displayStatus =
      "COMPLETED";

  }


  if (
    isCancelled
  ) {

    displayStatus =
      "CANCELLED";

  }


  /* =========================================
     SEAT DETAILS
  ========================================= */

  const seatObject =

    booking?.seat &&
    typeof booking.seat === "object"

      ? booking.seat

      : {};


  const seatNumber =

    booking?.seatNumber ||

    booking?.seatNo ||

    seatObject?.seatNumber ||

    seatObject?.seatNo ||

    seatObject?.number ||

    seatObject?.name ||

    (
      typeof booking?.seat === "string"

        ? booking.seat

        : null
    ) ||

    "N/A";


  /* =========================================
     FLOOR
  ========================================= */

  const rawFloor =

    booking?.floor ||

    booking?.floorNumber ||

    booking?.floorNo ||

    seatObject?.floor ||

    seatObject?.floorNumber ||

    seatObject?.floorNo ||

    seatObject?.location?.floor ||

    "N/A";


  const floorValue =

    rawFloor === null ||
    rawFloor === undefined ||
    rawFloor === ""

      ? "N/A"

      : String(
          rawFloor
        );


  const floorDisplay =

    floorValue === "N/A"

      ? "N/A"

      : floorValue
          .toLowerCase()
          .includes(
            "floor"
          )

        ? floorValue

        : `Floor ${floorValue}`;


  /* =========================================
     BOOKING TYPE
  ========================================= */

  const bookingType =

    booking?.type ||

    booking?.seatType ||

    seatObject?.type ||

    seatObject?.seatType ||

    "Study Seat";


  /* =========================================
     TIME VALUES
  ========================================= */

  const startTime =

    booking?.startTime ||

    booking?.start ||

    null;


  const endTime =

    booking?.endTime ||

    booking?.end ||

    null;


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

        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric",

      }

    );

  }


  /* =========================================
     SHORT DATE FOR QR
  ========================================= */

  function formatShortDate(
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

        day:
          "2-digit",

        month:
          "short",

        year:
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
     BOOKING DATE
  ========================================= */

  const bookingDate =

    booking?.date ||

    formatDate(
      startTime
    );


  /* =========================================
     BOOKING TIME
  ========================================= */

  const bookingTime =

    booking?.time ||

    (

      startTime &&
      endTime

        ? `${formatTime(
            startTime
          )} - ${formatTime(
            endTime
          )}`

        : startTime

          ? formatTime(
              startTime
            )

          : "N/A"

    );


  /* =========================================
     QR DATA

     The QR contains clean and readable
     reservation information.
  ========================================= */

  const qrData =

    `BOOKMYSEAT DIGITAL PASS
PASS ID: ${passId}
RESERVATION ID: ${reservationShortId}
SEAT: ${seatNumber}
LOCATION: ${floorDisplay}
DATE: ${formatShortDate(startTime)}
TIME: ${bookingTime}
STATUS: ${displayStatus}`;


  /* =========================================
     MAIN RETURN
  ========================================= */

  return (

    <div className="booking-success-page">


      {/* BACKGROUND */}

      <div className="success-grid"></div>

      <div className="success-orb success-orb-left"></div>

      <div className="success-orb success-orb-right"></div>


      {/* =========================================
         NAVBAR
      ========================================= */}

      <nav className="booking-success-nav">


        <button
          type="button"
          className="success-brand"
          onClick={goHome}
        >


          <div className="brand-icon">

            B

          </div>


          <div className="success-brand-text">


            <strong>

              BookMySeat

            </strong>


            <small>

              SMART LIBRARY ACCESS

            </small>


          </div>


        </button>


        <div

          className={`reservation-status ${
            isConfirmed &&
            !isCancelled

              ? "status-active"

              : "status-cancelled"
          }`}

        >


          <span className="status-dot"></span>


          {

            isConfirmed &&
            !isCancelled

              ? "RESERVATION ACTIVE"

              : "RESERVATION CANCELLED"

          }


        </div>


      </nav>


      {/* =========================================
         MAIN CONTAINER
      ========================================= */}

      <main className="booking-success-container">


        {/* =========================================
           SUCCESS HEADER
        ========================================= */}

        <section className="booking-success-header">


          <div

            className={`success-icon ${
              isConfirmed &&
              !isCancelled

                ? "success-confirmed"

                : "success-cancelled"
            }`}

          >


            <div className="checkmark">


              {

                isConfirmed &&
                !isCancelled

                  ? "✓"

                  : "!"

              }


            </div>


          </div>


          <p className="success-label">


            {

              isConfirmed &&
              !isCancelled

                ? "BOOKING SUCCESSFUL"

                : "RESERVATION DETAILS"

            }


          </p>


          <h1>


            Your seat is{" "}


            <span>


              {

                isConfirmed &&
                !isCancelled

                  ? "secured."

                  : "cancelled."

              }


            </span>


          </h1>


          <p className="success-description">


            {

              isConfirmed &&
              !isCancelled

                ? "Your study space has been reserved successfully. Your digital check-in pass is ready to use."

                : "This reservation is no longer active. You can book another seat whenever you're ready."

            }


          </p>


        </section>


        {/* =========================================
           DIGITAL PASS WRAPPER
        ========================================= */}

        <section className="digital-pass-wrapper">


          <div

            className={`digital-pass ${
              isCancelled

                ? "pass-cancelled"

                : ""
            }`}

          >


            {/* =========================================
               LEFT SIDE
            ========================================= */}

            <div className="pass-main">


              {/* PASS TOP */}

              <div className="pass-top">


                <div>


                  <span className="pass-label">

                    DIGITAL RESERVATION PASS

                  </span>


                  <h2>

                    {passId}

                  </h2>


                </div>


                <div

                  className={`pass-status ${
                    isConfirmed &&
                    !isCancelled

                      ? "pass-confirmed"

                      : "pass-inactive"
                  }`}

                >


                  <span>


                    {

                      isConfirmed &&
                      !isCancelled

                        ? "✓"

                        : "×"

                    }


                  </span>


                  {displayStatus}


                </div>


              </div>


              <div className="pass-line"></div>


              {/* =========================================
                 SEAT SECTION
              ========================================= */}

              <div className="seat-pass-section">


                <div className="seat-pass-info">


                  <span>

                    ASSIGNED STUDY SEAT

                  </span>


                  <h1>

                    {seatNumber}

                  </h1>


                  <p>

                    {bookingType}

                  </p>


                </div>


                <div className="seat-visual">


                  <div className="seat-glow"></div>


                  <span>

                    🪑

                  </span>


                </div>


              </div>


              {/* =========================================
                 PASS DETAILS
              ========================================= */}

              <div className="pass-details">


                <div className="pass-detail">


                  <span>

                    DATE

                  </span>


                  <strong>

                    {bookingDate}

                  </strong>


                </div>


                <div className="pass-detail">


                  <span>

                    TIME SLOT

                  </span>


                  <strong>

                    {bookingTime}

                  </strong>


                </div>


                <div className="pass-detail">


                  <span>

                    LOCATION

                  </span>


                  <strong>

                    {floorDisplay}

                  </strong>


                </div>


              </div>


            </div>


            {/* =========================================
               TICKET DIVIDER
            ========================================= */}

            <div className="pass-divider">


              <div className="pass-cut pass-cut-top"></div>


              <div className="dashed-divider"></div>


              <div className="pass-cut pass-cut-bottom"></div>


            </div>


            {/* =========================================
               QR SECTION
            ========================================= */}

            <div className="digital-checkin-section">


              <div className="checkin-heading">


                <span className="checkin-live-dot"></span>


                DIGITAL CHECK-IN


              </div>


              <div className="qr-wrapper">


                <div className="fake-qr">


                  <QRCodeSVG

                    value={qrData}

                    size={185}

                    level="M"

                    includeMargin={true}

                  />


                </div>


              </div>


              {/* =========================================
                 QR INFORMATION
              ========================================= */}

              <div className="qr-pass-info">


                <div className="qr-info-row">


                  <span>

                    SEAT ACCESS

                  </span>


                  <strong>

                    {seatNumber}

                  </strong>


                </div>


                <div className="qr-info-row">


                  <span>

                    FLOOR

                  </span>


                  <strong>

                    {floorDisplay}

                  </strong>


                </div>


              </div>


              <small>


                {

                  isConfirmed &&
                  !isCancelled

                    ? "Scan this QR code at the library entrance"

                    : "This digital pass is inactive"

                }


              </small>


            </div>


          </div>


          {/* =========================================
             ACTION BUTTONS
          ========================================= */}

          <div className="success-actions">


            <button

              type="button"

              className="success-outline-btn"

              onClick={bookAnother}

            >


              <span>

                ←

              </span>


              Book another seat


            </button>


            <button

              type="button"

              className="success-outline-btn"

              onClick={viewReservations}

            >


              <span>

                ▦

              </span>


              My Reservations


            </button>


            <button

              type="button"

              className="success-home-btn"

              onClick={goHome}

            >


              Back to home


              <strong>

                →

              </strong>


            </button>


          </div>


        </section>


        {/* =========================================
           CHECK-IN INFORMATION
        ========================================= */}

        <section

          className={`checkin-info-card ${
            isCancelled

              ? "checkin-info-inactive"

              : ""
          }`}

        >


          <div className="info-icon">


            {

              isConfirmed &&
              !isCancelled

                ? "i"

                : "!"

            }


          </div>


          <div>


            <span className="info-label">


              {

                isConfirmed &&
                !isCancelled

                  ? "IMPORTANT REMINDER"

                  : "RESERVATION STATUS"

              }


            </span>


            <h4>


              {

                isConfirmed &&
                !isCancelled

                  ? "Don't forget to check in"

                  : "This reservation has been cancelled"

              }


            </h4>


            <p>


              {

                isConfirmed &&
                !isCancelled

                  ? "Show this digital pass at the library entrance. The QR code contains your reservation ID, seat number, floor, date, time slot and current booking status."

                  : "You can return to the seat explorer and create a new reservation at any time."

              }


            </p>


          </div>


          {

            isConfirmed &&
            !isCancelled && (

              <div className="checkin-time">


                <span>

                  PASS ID

                </span>


                <strong>

                  {passId}

                </strong>


              </div>

            )

          }


        </section>


      </main>


    </div>

  );

}


export default BookingSuccess;