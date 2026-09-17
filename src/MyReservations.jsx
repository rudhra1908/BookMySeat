import {
  useState,
  useEffect,
  useCallback,
} from "react";

import "./MyReservations.css";
import { api } from "./services/api";
import { useAuth } from "./AuthContext";


function MyReservations({ goHome }) {

  /* =========================================
     AUTH
  ========================================= */

  const { token } = useAuth();


  /* =========================================
     STATES
  ========================================= */

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);


  /* =========================================
     NORMALIZE RESERVATION
  ========================================= */

  function normalizeReservation(item) {

    if (!item || typeof item !== "object") {
      return null;
    }

    return item.reservation || item.data || item;
  }


  /* =========================================
     LOAD RESERVATIONS
  ========================================= */

  const loadReservations = useCallback(
    async (showLoading = false) => {

      if (!token) {
        setReservations([]);
        setLoading(false);
        return;
      }

      try {

        if (showLoading) {
          setLoading(true);
        }

        setErrorMessage("");

        const response =
          await api.getMyReservations(token);

        let reservationData = [];

        if (Array.isArray(response)) {

          reservationData = response;

        } else if (Array.isArray(response?.reservations)) {

          reservationData = response.reservations;

        } else if (Array.isArray(response?.data)) {

          reservationData = response.data;

        } else if (response?.reservation) {

          reservationData = [response.reservation];

        }

        const cleanReservations =
          reservationData
            .map(normalizeReservation)
            .filter(Boolean);

        setReservations(cleanReservations);

      } catch (error) {

        console.error(
          "Failed to load reservations:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Failed to load your reservations."
        );

      } finally {

        setLoading(false);

      }

    },
    [token]
  );


  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {

    loadReservations(true);

  }, [loadReservations]);


  /* =========================================
     LIVE CLOCK
  ========================================= */

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentTime(new Date());

    }, 1000);

    return () => {

      clearInterval(timer);

    };

  }, []);


  /* =========================================
     AUTO REFRESH
  ========================================= */

  useEffect(() => {

    const refreshTimer = setInterval(() => {

      loadReservations(false);

    }, 30000);

    return () => {

      clearInterval(refreshTimer);

    };

  }, [loadReservations]);


  /* =========================================
     NOTIFICATION
  ========================================= */

  function showNotification(type, message) {

    setNotification({
      type,
      message,
    });

    setTimeout(() => {

      setNotification(null);

    }, 5000);

  }


  /* =========================================
     DATE FORMAT
  ========================================= */

  function formatDate(date) {

    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  }


  /* =========================================
     TIME FORMAT
  ========================================= */

  function formatTime(date) {

    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  }


  /* =========================================
     DATE + TIME FORMAT
  ========================================= */

  function formatDateTime(date) {

    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  }


  /* =========================================
     GET SEAT NAME
  ========================================= */

  function getSeatName(reservation) {

    if (!reservation) {
      return "Seat";
    }

    const seat = reservation.seat;

    if (
      seat &&
      typeof seat === "object"
    ) {

      return (
        seat.seatNumber ||
        seat.seatNo ||
        seat.number ||
        seat.name ||
        seat.label ||
        "Seat"
      );

    }

    return (
      seat ||
      reservation.seatNumber ||
      reservation.seatNo ||
      reservation.seatName ||
      "Seat"
    );

  }


  /* =========================================
     GET FLOOR
  ========================================= */

  function getFloor(reservation) {

    if (!reservation) {
      return "N/A";
    }

    const seat = reservation.seat;

    let floor = null;

    if (
      seat &&
      typeof seat === "object"
    ) {

      floor =
        seat.floor ??
        seat.floorNumber ??
        seat.floorNo ??
        seat.location?.floor ??
        null;

    }

    floor =
      floor ??
      reservation.floor ??
      reservation.floorNumber ??
      reservation.floorNo ??
      null;

    if (
      floor === null ||
      floor === undefined ||
      floor === ""
    ) {

      return "N/A";

    }

    if (
      typeof floor === "string" &&
      floor.toLowerCase().includes("floor")
    ) {

      return floor;

    }

    return `Floor ${floor}`;

  }


  /* =========================================
     GET STATUS
  ========================================= */

  function normalizeStatus(status) {

    if (!status) {
      return "";
    }

    return String(status)
      .toLowerCase()
      .trim()
      .replace(/_/g, "-");

  }


  /* =========================================
     STATUS LABEL
  ========================================= */

  function getStatusLabel(status) {

    const normalized =
      normalizeStatus(status);

    switch (normalized) {

      case "booked":
      case "confirmed":
      case "active":
        return "BOOKED";

      case "checked-in":
      case "checkedin":
        return "CHECKED IN";

      case "completed":
        return "COMPLETED";

      case "cancelled":
      case "canceled":
        return "CANCELLED";

      default:
        return normalized
          ? normalized.toUpperCase()
          : "BOOKED";

    }

  }


  /* =========================================
     STATUS CLASS
  ========================================= */

  function getStatusClass(status) {

    const normalized =
      normalizeStatus(status);

    switch (normalized) {

      case "booked":
      case "confirmed":
      case "active":
        return "status-booked";

      case "checked-in":
      case "checkedin":
        return "status-checked-in";

      case "completed":
        return "status-completed";

      case "cancelled":
      case "canceled":
        return "status-cancelled";

      default:
        return "status-booked";

    }

  }


  /* =========================================
     CHECK-IN OPEN TIME
  ========================================= */

  function getCheckInOpenTime(reservation) {

    const start = new Date(
      reservation?.startTime
    );

    if (Number.isNaN(start.getTime())) {
      return null;
    }

    return new Date(
      start.getTime() -
      30 * 60 * 1000
    );

  }


  /* =========================================
     CHECK-IN DEADLINE
  ========================================= */

  function getCheckInDeadline(reservation) {

    if (reservation?.checkInDeadline) {

      const deadline =
        new Date(
          reservation.checkInDeadline
        );

      if (
        !Number.isNaN(
          deadline.getTime()
        )
      ) {

        return deadline;

      }

    }

    const start =
      new Date(
        reservation?.startTime
      );

    if (
      Number.isNaN(
        start.getTime()
      )
    ) {

      return null;

    }

    return new Date(
      start.getTime() +
      35 * 60 * 1000
    );

  }


  /* =========================================
     IS BOOKED
  ========================================= */

  function isBooked(reservation) {

    const status =
      normalizeStatus(
        reservation?.status
      );

    return (
      status === "booked" ||
      status === "confirmed" ||
      status === "active" ||
      status === ""
    );

  }


  /* =========================================
     IS CHECKED IN
  ========================================= */

  function isCheckedIn(reservation) {

    const status =
      normalizeStatus(
        reservation?.status
      );

    return (
      status === "checked-in" ||
      status === "checkedin"
    );

  }


  /* =========================================
     CAN CHECK IN
  ========================================= */

  function canCheckIn(reservation) {

    if (!isBooked(reservation)) {
      return false;
    }

    const openTime =
      getCheckInOpenTime(
        reservation
      );

    const deadline =
      getCheckInDeadline(
        reservation
      );

    const end =
      new Date(
        reservation?.endTime
      );

    if (
      !openTime ||
      !deadline ||
      Number.isNaN(
        end.getTime()
      )
    ) {

      return false;

    }

    return (
      currentTime >= openTime &&
      currentTime <= deadline &&
      currentTime < end
    );

  }


  /* =========================================
     CHECK-IN TOO EARLY
  ========================================= */

  function isCheckInTooEarly(reservation) {

    if (!isBooked(reservation)) {
      return false;
    }

    const openTime =
      getCheckInOpenTime(
        reservation
      );

    if (!openTime) {
      return false;
    }

    return currentTime < openTime;

  }


  /* =========================================
     CHECK-IN EXPIRED
  ========================================= */

  function isCheckInExpired(reservation) {

    if (!isBooked(reservation)) {
      return false;
    }

    const deadline =
      getCheckInDeadline(
        reservation
      );

    if (!deadline) {
      return false;
    }

    return currentTime > deadline;

  }


  /* =========================================
     CAN CHECK OUT
  ========================================= */

  function canCheckOut(reservation) {

    return isCheckedIn(reservation);

  }


  /* =========================================
     FORMAT COUNTDOWN
  ========================================= */

  function formatCountdown(milliseconds) {

    if (
      !Number.isFinite(milliseconds) ||
      milliseconds <= 0
    ) {

      return "00:00";

    }

    const totalSeconds =
      Math.floor(
        milliseconds / 1000
      );

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {

      return `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

    }

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  }


  /* =========================================
     CHECK-IN COUNTDOWN
  ========================================= */

  function getCheckInCountdown(reservation) {

    const deadline =
      getCheckInDeadline(
        reservation
      );

    if (!deadline) {
      return "00:00";
    }

    return formatCountdown(
      deadline.getTime() -
      currentTime.getTime()
    );

  }


  /* =========================================
     SLOT COUNTDOWN
  ========================================= */

  function getSlotCountdown(reservation) {

    const end =
      new Date(
        reservation?.endTime
      );

    if (
      Number.isNaN(
        end.getTime()
      )
    ) {

      return "00:00";

    }

    return formatCountdown(
      end.getTime() -
      currentTime.getTime()
    );

  }


  /* =========================================
     CHECKOUT WARNING
  ========================================= */

  function isCheckoutWarning(reservation) {

    if (
      !canCheckOut(reservation)
    ) {

      return false;

    }

    const end =
      new Date(
        reservation?.endTime
      );

    if (
      Number.isNaN(
        end.getTime()
      )
    ) {

      return false;

    }

    const difference =
      end.getTime() -
      currentTime.getTime();

    return (
      difference > 0 &&
      difference <=
      5 * 60 * 1000
    );

  }


  /* =========================================
     CHECK-IN
  ========================================= */

  async function handleCheckIn(reservationId) {

    try {

      setActionLoading(
        reservationId
      );

      const response =
        await api.checkInReservation(
          reservationId,
          token
        );

      showNotification(
        "success",
        response?.message ||
        "Checked in successfully!"
      );

      await loadReservations(false);

    } catch (error) {

      showNotification(
        "error",
        error?.message ||
        "Failed to check in."
      );

    } finally {

      setActionLoading(null);

    }

  }


  /* =========================================
     CHECK-OUT
  ========================================= */

  async function handleCheckOut(reservationId) {

    try {

      setActionLoading(
        reservationId
      );

      const response =
        await api.completeReservation(
          reservationId,
          token
        );

      showNotification(
        "success",
        response?.message ||
        "Checked out successfully!"
      );

      await loadReservations(false);

    } catch (error) {

      showNotification(
        "error",
        error?.message ||
        "Failed to check out."
      );

    } finally {

      setActionLoading(null);

    }

  }


  /* =========================================
     CANCEL RESERVATION
  ========================================= */

  async function handleCancel(reservationId) {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this reservation?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(
        reservationId
      );

      const response =
        await api.cancelReservation(
          reservationId,
          token
        );

      showNotification(
        "success",
        response?.message ||
        "Reservation cancelled successfully."
      );

      await loadReservations(false);

    } catch (error) {

      showNotification(
        "error",
        error?.message ||
        "Failed to cancel reservation."
      );

    } finally {

      setActionLoading(null);

    }

  }


  /* =========================================
     VIEW DIGITAL PASS
  ========================================= */

  function handleViewPass(reservation) {

    if (!reservation) {
      return;
    }

    setSelectedPass(reservation);

  }


  function closePass() {

    setSelectedPass(null);

  }


  /* =========================================
     QR DATA
  ========================================= */

  function getQRData(reservation) {

    return JSON.stringify({

      reservationId:
        reservation?._id ||
        reservation?.id ||
        "N/A",

      seat:
        getSeatName(reservation),

      floor:
        getFloor(reservation),

      startTime:
        reservation?.startTime ||
        "N/A",

      endTime:
        reservation?.endTime ||
        "N/A",

      status:
        getStatusLabel(
          reservation?.status
        ),

    });

  }


  /* =========================================
     QR CODE URL
  ========================================= */

  function getQRCodeUrl(reservation) {
  const qrData = encodeURIComponent(
    getQRData(reservation)
  );

  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;
}

  /* =========================================
     ACTIVE + HISTORY
  ========================================= */

  const activeReservations =
    reservations.filter(
      (reservation) => {

        const status =
          normalizeStatus(
            reservation?.status
          );

        return (
          status === "booked" ||
          status === "confirmed" ||
          status === "active" ||
          status === "checked-in" ||
          status === "checkedin" ||
          status === ""
        );

      }
    );


  const historyReservations =
    reservations.filter(
      (reservation) => {

        const status =
          normalizeStatus(
            reservation?.status
          );

        return (
          status === "completed" ||
          status === "cancelled" ||
          status === "canceled"
        );

      }
    );


  /* =========================================
     RESERVATION CARD
  ========================================= */

  function renderReservationCard(
    reservation,
    index
  ) {

    const reservationId =
      reservation?._id ||
      reservation?.id ||
      `reservation-${index}`;

    const loadingAction =
      actionLoading === reservationId;

    const checkInAvailable =
      canCheckIn(reservation);

    const tooEarly =
      isCheckInTooEarly(reservation);

    const checkInExpired =
      isCheckInExpired(reservation);

    const checkoutWarning =
      isCheckoutWarning(reservation);


    return (

      <div
        key={reservationId}
        className={`reservation-card ${
          canCheckOut(reservation)
            ? "active-reservation"
            : ""
        }`}
      >

        <div className="reservation-card-header">

          <div>

            <span className="reservation-id-label">
              RESERVATION ID
            </span>

            <strong className="reservation-id">
              #{String(reservationId)
                .slice(-8)
                .toUpperCase()}
            </strong>

          </div>


          <div
            className={`status-badge ${getStatusClass(
              reservation?.status
            )}`}
          >

            <span></span>

            {getStatusLabel(
              reservation?.status
            )}

          </div>

        </div>


        <div className="reservation-main">

          <div className="seat-visual">
            ♟
          </div>


          <div className="seat-information">

            <span>
              YOUR RESERVED SEAT
            </span>

            <h2>
              {getSeatName(reservation)}
            </h2>

            <p>
              {getFloor(reservation)}
            </p>

          </div>


          <button
            type="button"
            className="view-pass-btn"
            onClick={() =>
              handleViewPass(reservation)
            }
          >

            <span>▣</span>

            View Pass

          </button>

        </div>


        <div className="reservation-details-grid">

          <div className="reservation-detail">

            <span>
              📅 DATE
            </span>

            <strong>
              {formatDate(
                reservation?.startTime
              )}
            </strong>

          </div>


          <div className="reservation-detail">

            <span>
              ⏱ START TIME
            </span>

            <strong>
              {formatTime(
                reservation?.startTime
              )}
            </strong>

          </div>


          <div className="reservation-detail">

            <span>
              ⏳ END TIME
            </span>

            <strong>
              {formatTime(
                reservation?.endTime
              )}
            </strong>

          </div>

        </div>


        {isBooked(reservation) && (

          <div className="reservation-alert-area">

            {tooEarly && (

              <div className="reservation-info">

                <strong>
                  Check-in not open yet
                </strong>

                <span>
                  Check-in opens at{" "}
                  {formatTime(
                    getCheckInOpenTime(
                      reservation
                    )
                  )}
                </span>

              </div>

            )}


            {checkInAvailable && (

              <div className="checkin-countdown-box">

                <div>

                  <span>
                    CHECK-IN DEADLINE
                  </span>

                  <strong>
                    {formatTime(
                      getCheckInDeadline(
                        reservation
                      )
                    )}
                  </strong>

                </div>


                <div className="countdown-value">
                  {getCheckInCountdown(
                    reservation
                  )}
                </div>


                <p>
                  Please check in before the
                  countdown ends.
                </p>

              </div>

            )}


            {checkInExpired && (

              <div className="reservation-danger">

                <strong>
                  Check-in deadline expired
                </strong>

                <span>
                  Your reservation may no
                  longer be available.
                </span>

              </div>

            )}

          </div>

        )}


        {canCheckOut(reservation) && (

          <div className="active-session-box">

            <div>

              <span>
                SESSION ACTIVE
              </span>

              <strong>
                Time Remaining
              </strong>

            </div>


            <div className="session-countdown">
              {getSlotCountdown(
                reservation
              )}
            </div>

          </div>

        )}


        {checkoutWarning && (

          <div className="checkout-warning">

            <div className="warning-icon">
              !
            </div>

            <div>

              <strong>
                Your session is ending soon
              </strong>

              <p>
                Only{" "}
                {getSlotCountdown(
                  reservation
                )}{" "}
                remaining.
              </p>

            </div>

          </div>

        )}


        {normalizeStatus(
          reservation?.status
        ) === "cancelled" && (

          <div className="cancelled-info">

            <strong>
              Reservation Cancelled
            </strong>

            <p>
              {reservation?.cancellationReason ||
                "This reservation is no longer active."}
            </p>

          </div>

        )}


        {normalizeStatus(
          reservation?.status
        ) === "completed" && (

          <div className="completed-info">

            <strong>
              Reservation Completed
            </strong>

            <p>
              {reservation?.checkedOutAt
                ? `Checked out on ${formatDateTime(
                    reservation.checkedOutAt
                  )}`
                : "Your booking session has ended."}
            </p>

          </div>

        )}


        <div className="reservation-actions">

          {isBooked(reservation) && (

            <button
              type="button"
              disabled={
                loadingAction ||
                !checkInAvailable
              }
              className={`checkin-btn ${
                !checkInAvailable
                  ? "action-disabled"
                  : ""
              }`}
              onClick={() =>
                handleCheckIn(
                  reservationId
                )
              }
            >

              {loadingAction
                ? "Processing..."
                : checkInAvailable
                  ? "✓ Check In"
                  : "Check In"}

            </button>

          )}


          {canCheckOut(reservation) && (

            <button
              type="button"
              disabled={loadingAction}
              className="checkout-btn"
              onClick={() =>
                handleCheckOut(
                  reservationId
                )
              }
            >

              {loadingAction
                ? "Processing..."
                : "Check Out →"}

            </button>

          )}


          {isBooked(reservation) && (

            <button
              type="button"
              disabled={loadingAction}
              className="cancel-btn"
              onClick={() =>
                handleCancel(
                  reservationId
                )
              }
            >
              Cancel Reservation
            </button>

          )}

        </div>

      </div>

    );

  }


  /* =========================================
     MAIN UI
  ========================================= */

  return (

    <div className="my-reservations-page">

      <div className="reservations-grid"></div>

      <div className="reservation-orb orb-one"></div>

      <div className="reservation-orb orb-two"></div>


      <nav className="reservations-navbar">

        <button
          type="button"
          className="reservation-brand"
          onClick={goHome}
        >

          <div className="reservation-brand-icon">
            B
          </div>

          <div>

            <strong>
              BookMySeat
            </strong>

            <small>
              SMART LIBRARY
            </small>

          </div>

        </button>


        <button
          type="button"
          className="back-dashboard-btn"
          onClick={goHome}
        >
          ← Back to Home
        </button>

      </nav>


      {notification && (

        <div
          className={`reservation-toast ${
            notification.type === "success"
              ? "toast-success"
              : "toast-error"
          }`}
        >

          <strong>
            {notification.type === "success"
              ? "✓"
              : "!"}
          </strong>

          <span>
            {notification.message}
          </span>

        </div>

      )}


      <main className="reservations-container">

        <section className="reservations-header">

          <div>

            <div className="page-label">

              <span></span>

              MY RESERVATIONS

            </div>


            <h1>

              Your study

              <span>
                {" "}sessions.
              </span>

            </h1>


            <p>
              Manage your reserved seats,
              check in to your session and
              keep track of your library
              bookings.
            </p>

          </div>


          <div className="reservation-stats">

            <div>

              <strong>
                {activeReservations.length}
              </strong>

              <span>
                Active
              </span>

            </div>


            <div>

              <strong>
                {historyReservations.length}
              </strong>

              <span>
                History
              </span>

            </div>

          </div>

        </section>


        {loading && (

          <div className="reservations-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading your reservations...
            </p>

          </div>

        )}


        {!loading &&
          errorMessage && (

          <div className="reservations-error">

            <p>
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                loadReservations(true)
              }
            >
              Try Again
            </button>

          </div>

        )}


        {!loading &&
          !errorMessage && (

          <>

            <section className="reservations-section">

              <div className="section-heading">

                <div>

                  <span>
                    CURRENT BOOKINGS
                  </span>

                  <h2>
                    Active Reservations
                  </h2>

                </div>


                <div className="live-status">

                  <span></span>

                  LIVE

                </div>

              </div>


              {activeReservations.length > 0 ? (

                <div className="reservations-list">

                  {activeReservations.map(
                    (
                      reservation,
                      index
                    ) =>
                      renderReservationCard(
                        reservation,
                        index
                      )
                  )}

                </div>

              ) : (

                <div className="empty-reservations">

                  <div>
                    ♙
                  </div>

                  <h3>
                    No active reservations
                  </h3>

                  <p>
                    You currently don't have
                    any active seat bookings.
                  </p>

                  <button
                    type="button"
                    onClick={goHome}
                  >
                    Explore Seats
                  </button>

                </div>

              )}

            </section>


            {historyReservations.length > 0 && (

              <section className="reservations-section history-section">

                <div className="section-heading">

                  <div>

                    <span>
                      PREVIOUS BOOKINGS
                    </span>

                    <h2>
                      Reservation History
                    </h2>

                  </div>

                </div>


                <div className="reservations-list">

                  {historyReservations.map(
                    (
                      reservation,
                      index
                    ) =>
                      renderReservationCard(
                        reservation,
                        index
                      )
                  )}

                </div>

              </section>

            )}

          </>

        )}

      </main>


      {selectedPass && (

        <div
          className="digital-pass-overlay"
          onClick={closePass}
        >

          <div
            className="digital-pass-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="pass-close-btn"
              onClick={closePass}
            >
              ×
            </button>


            <div className="pass-top">

              <div className="pass-logo">
                B
              </div>


              <div>

                <span>
                  BOOKMYSEAT
                </span>

                <strong>
                  DIGITAL ACCESS PASS
                </strong>

              </div>


              <div
                className={`pass-status ${getStatusClass(
                  selectedPass?.status
                )}`}
              >
                {getStatusLabel(
                  selectedPass?.status
                )}
              </div>

            </div>


            <div className="pass-body">

              <div className="pass-details">

                <div className="pass-seat-section">

                  <span>
                    ASSIGNED SEAT
                  </span>

                  <h1>
                    {getSeatName(
                      selectedPass
                    )}
                  </h1>

                  <p>
                    {getFloor(
                      selectedPass
                    )}
                  </p>

                </div>


                <div className="pass-detail-grid">

                  <div>

                    <span>
                      DATE
                    </span>

                    <strong>
                      {formatDate(
                        selectedPass?.startTime
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      TIME
                    </span>

                    <strong>

                      {formatTime(
                        selectedPass?.startTime
                      )}

                      {" - "}

                      {formatTime(
                        selectedPass?.endTime
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      CHECK-IN OPENS
                    </span>

                    <strong>
                      {formatTime(
                        getCheckInOpenTime(
                          selectedPass
                        )
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      CHECK-IN DEADLINE
                    </span>

                    <strong>
                      {formatTime(
                        getCheckInDeadline(
                          selectedPass
                        )
                      )}
                    </strong>

                  </div>

                </div>


                <div className="pass-id">

                  <span>
                    PASS ID
                  </span>

                  <strong>

                    BMS-

                    {String(
                      selectedPass?._id ||
                      selectedPass?.id ||
                      "UNKNOWN"
                    )
                      .slice(-10)
                      .toUpperCase()}

                  </strong>

                </div>

              </div>


              <div className="pass-qr-section">

                <div className="qr-container">

                  <img
                    src={
                      getQRCodeUrl(
                        selectedPass
                      )
                    }
                    alt="Reservation QR Code"
                    onError={(event) => {

                      event.currentTarget.style.display =
                        "none";

                    }}
                  />

                </div>


                <strong>
                  Scan to Verify
                </strong>


                <p>
                  Present this QR code
                  during library check-in.
                </p>

              </div>

            </div>


            <div className="pass-footer">

              <div>

                <span>
                  VALID FOR
                </span>

                <strong>

                  {normalizeStatus(
                    selectedPass?.status
                  ) === "cancelled"
                    ? "INVALID"
                    : normalizeStatus(
                        selectedPass?.status
                      ) === "completed"
                      ? "SESSION ENDED"
                      : "LIBRARY ACCESS"}

                </strong>

              </div>


              <div>

                <span>
                  GENERATED
                </span>

                <strong>

                  {formatDateTime(
                    selectedPass?.createdAt
                  )}

                </strong>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default MyReservations;