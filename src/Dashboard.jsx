import {
  useEffect,
  useState,
} from "react";

import "./Dashboard.css";


function Dashboard({

  user,

  reservations = [],

  goBack,

  goHome,

  goBooking,

  goReservations,

  goProfile,

  goHelpSupport,

  findSeat,

  viewReservations,

  viewProfile,

  getHelp,

  logout,

}) {


  /* =========================================
     LOCAL STATES
  ========================================= */

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

  useEffect(() => {

    const interval =
      setInterval(() => {

        setCurrentTime(
          new Date()
        );

      }, 1000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  /* =========================================
     USER INFORMATION
  ========================================= */

  const userName =
    user?.name ||
    user?.firstName ||
    "Student";


  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();


  /* =========================================
     NORMALIZE STATUS
  ========================================= */

  const normalizeStatus =
    (status) => {

      return String(
        status ||
        ""
      )
        .trim()
        .toLowerCase();

    };


  /* =========================================
     RESERVATION COUNTS
  ========================================= */

  const totalReservations =
    reservations.length;


  /* =========================================
     ACTIVE RESERVATIONS

     A reservation is active only when:
     - Its status is booked/confirmed/active/checked-in
     - AND its scheduled end time has not passed

     This prevents old "booked" reservations
     from being counted as active bookings.
  ========================================= */

  const activeReservations =
    reservations.filter(
      (reservation) => {

        const status =
          normalizeStatus(
            reservation.status
          );


        const isActiveStatus =

          status === "booked" ||

          status === "confirmed" ||

          status === "active" ||

          status === "checked-in" ||

          status === "checkedin";


        if (
          !isActiveStatus
        ) {

          return false;

        }


        /* =====================================
           RESERVATION MUST HAVE A VALID END TIME
        ====================================== */

        if (
          !reservation?.endTime
        ) {

          return false;

        }


        const reservationEndTime =
          new Date(
            reservation.endTime
          );


        /* =====================================
           INVALID DATE = NOT ACTIVE
        ====================================== */

        if (
          Number.isNaN(
            reservationEndTime.getTime()
          )
        ) {

          return false;

        }


        /* =====================================
           ONLY RESERVATIONS THAT HAVE NOT
           FINISHED YET ARE ACTIVE
        ====================================== */

        return (
          reservationEndTime >
          currentTime
        );

      }
    );


  const activeReservationCount =
    activeReservations.length;


  /* =========================================
     COMPLETED RESERVATIONS
  ========================================= */

  const completedReservations =
    reservations.filter(
      (reservation) => {

        const status =
          normalizeStatus(
            reservation.status
          );

        return (

          status === "completed" ||

          status === "complete"

        );

      }
    );


  const completedReservationCount =
    completedReservations.length;


  /* =========================================
     CANCELLED RESERVATIONS
  ========================================= */

  const cancelledReservations =
    reservations.filter(
      (reservation) => {

        const status =
          normalizeStatus(
            reservation.status
          );

        return (

          status === "cancelled" ||

          status === "canceled"

        );

      }
    );


  const cancelledReservationCount =
    cancelledReservations.length;


  /* =========================================
     UPCOMING RESERVATION
  ========================================= */

  const upcomingReservation =
    activeReservations
      .filter(
        (reservation) => {

          if (
            !reservation?.endTime
          ) {

            return false;

          }


          const reservationEndTime =
            new Date(
              reservation.endTime
            );


          if (
            Number.isNaN(
              reservationEndTime.getTime()
            )
          ) {

            return false;

          }


          return (
            reservationEndTime >
            currentTime
          );

        }
      )
      .slice()
      .sort(
        (
          firstReservation,
          secondReservation
        ) => {

          const firstDate =
            new Date(
              firstReservation.startTime ||
              firstReservation.date ||
              0
            );


          const secondDate =
            new Date(
              secondReservation.startTime ||
              secondReservation.date ||
              0
            );


          return (
            firstDate -
            secondDate
          );

        }
      )[0] || null;


  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate =
    (dateValue) => {

      if (!dateValue) {

        return "Not available";

      }


      try {

        const date =
          new Date(
            dateValue
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return dateValue;

        }


        return date.toLocaleDateString(
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

      catch {

        return dateValue;

      }

    };


  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime =
    (timeValue) => {

      if (!timeValue) {

        return "Not available";

      }


      try {

        const date =
          new Date(
            timeValue
          );


        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {

          return date.toLocaleTimeString(
            "en-IN",
            {

              hour:
                "2-digit",

              minute:
                "2-digit",

            }
          );

        }


        return timeValue;

      }

      catch {

        return timeValue;

      }

    };


  /* =========================================
     GO TO HOME
  ========================================= */

  const handleGoHome =
    () => {

      /* =====================================
         FIRST PRIORITY:
         USE goHome FUNCTION FROM PARENT
      ====================================== */

      if (
        typeof goHome ===
        "function"
      ) {

        goHome();

        return;

      }


      /* =====================================
         SECOND PRIORITY:
         USE goBack FUNCTION
      ====================================== */

      if (
        typeof goBack ===
        "function"
      ) {

        goBack();

        return;

      }


      /* =====================================
         FINAL FALLBACK:
         BROWSER HISTORY
      ====================================== */

      if (
        window.history.length > 1
      ) {

        window.history.back();

        return;

      }


      /* =====================================
         LAST FALLBACK:
         ROOT URL
      ====================================== */

      window.location.href =
        "/";

    };


  /* =========================================
     GET SEAT LABEL
  ========================================= */

  const getSeatLabel =
    (reservation) => {

      if (!reservation) {

        return "No Seat";

      }


      if (
        typeof reservation.seat ===
        "string"
      ) {

        return reservation.seat;

      }


      if (
        reservation.seat?.seatNumber
      ) {

        return reservation.seat.seatNumber;

      }


      if (
        reservation.seat?.seatNo
      ) {

        return reservation.seat.seatNo;

      }


      if (
        reservation.seat?.seatId
      ) {

        return reservation.seat.seatId;

      }


      if (
        reservation.seat?.name
      ) {

        return reservation.seat.name;

      }


      if (
        reservation.seatNumber
      ) {

        return reservation.seatNumber;

      }


      return "Seat";

    };


  /* =========================================
     GET FLOOR LABEL
  ========================================= */

  const getFloorLabel =
    (reservation) => {

      if (
        reservation?.floor
      ) {

        return String(
          reservation.floor
        );

      }


      if (
        reservation?.selectedFloor
      ) {

        return String(
          reservation.selectedFloor
        );

      }


      if (
        reservation?.seat?.floor
      ) {

        return `Floor ${
          reservation.seat.floor
        }`;

      }


      return "Library";

    };


  /* =========================================
     GET STATUS CLASS
  ========================================= */

  const getStatusClass =
    (status) => {

      const normalizedStatus =
        normalizeStatus(
          status
        );


      if (

        normalizedStatus ===
        "completed" ||

        normalizedStatus ===
        "complete"

      ) {

        return "status-completed";

      }


      if (

        normalizedStatus ===
          "cancelled" ||

        normalizedStatus ===
          "canceled"

      ) {

        return "status-cancelled";

      }


      if (

        normalizedStatus ===
          "checked-in" ||

        normalizedStatus ===
          "checkedin"

      ) {

        return "status-checkedin";

      }


      return "status-active";

    };


  /* =========================================
     WELCOME TIME
  ========================================= */

  const currentHour =
    currentTime.getHours();


  let greeting =
    "Good morning";


  if (
    currentHour >= 12 &&
    currentHour < 17
  ) {

    greeting =
      "Good afternoon";

  }


  if (
    currentHour >= 17
  ) {

    greeting =
      "Good evening";

  }


  /* =========================================
     DASHBOARD UI
  ========================================= */

  return (

    <div className="dashboard-page">


      {/* =====================================
          BACKGROUND
      ====================================== */}

      <div className="dashboard-grid"></div>

      <div className="dashboard-orb dashboard-orb-one"></div>

      <div className="dashboard-orb dashboard-orb-two"></div>


      {/* =====================================
          NAVBAR
      ====================================== */}

      <nav className="dashboard-navbar">


        {/* ===================================
            BRAND / RETURN TO HOME
        ==================================== */}

        <button
          className="dashboard-brand"
          onClick={handleGoHome}
          title="Return to Home"
        >

          <div className="dashboard-brand-icon">

            B

          </div>


          <div>

            <strong>

              BookMySeat

            </strong>


            <small>

              SMART LIBRARY SYSTEM

            </small>

          </div>

        </button>


        <div className="dashboard-nav-links">


          {/* =================================
              DASHBOARD
          ================================== */}

          <button
            className="dashboard-nav-active"
          >

            Dashboard

          </button>


          {/* =================================
              FIND A SEAT
          ================================== */}

          <button
            onClick={goBooking}
          >

            Find a Seat

          </button>


          {/* =================================
              MY RESERVATIONS
          ================================== */}

          <button
            onClick={goReservations}
          >

            My Reservations

          </button>


          {/* =================================
              HELP
          ================================== */}

          <button
            onClick={goHelpSupport}
          >

            Help

          </button>

        </div>


        <div className="dashboard-user-actions">


          <button
            className="dashboard-profile-button"
            onClick={goProfile}
            title="Open Profile"
          >

            <div className="dashboard-avatar">

              {userInitial}

            </div>


            <div className="dashboard-user-name">

              <strong>

                {userName}

              </strong>


              <small>

                Student

              </small>

            </div>

          </button>


          <button
            className="dashboard-logout-button"
            onClick={logout}
          >

            Logout

          </button>

        </div>

      </nav>


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="dashboard-main">


        {/* ===================================
            RETURN TO HOME BUTTON
        ==================================== */}

        <div className="dashboard-home-navigation">

          <button
            className="dashboard-return-home-button"
            onClick={handleGoHome}
            title="Return to Home"
          >

            ← Return to Home

          </button>

        </div>


        {/* ===================================
            WELCOME
        ==================================== */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-greeting">

              {greeting}

            </p>


            <h1>

              Welcome back,

              <span>

                {" "}
                {userName}!

              </span>

            </h1>


            <p className="dashboard-subtitle">

              Manage your study space,
              reservations and library sessions
              from one place.

            </p>

          </div>


          <div className="dashboard-date-card">

            <div className="dashboard-date-icon">

              ◷

            </div>


            <div>

              <strong>

                {currentTime.toLocaleTimeString(
                  "en-IN",
                  {

                    hour:
                      "2-digit",

                    minute:
                      "2-digit",

                    second:
                      "2-digit",

                  }
                )}

              </strong>


              <small>

                {currentTime.toLocaleDateString(
                  "en-IN",
                  {

                    weekday:
                      "long",

                    day:
                      "numeric",

                    month:
                      "long",

                  }
                )}

              </small>

            </div>

          </div>

        </section>


        {/* ===================================
            STATISTICS
        ==================================== */}

        <section className="dashboard-stats-grid">


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon stat-blue">

              ▣

            </div>


            <div>

              <span>

                Total Reservations

              </span>


              <strong>

                {totalReservations}

              </strong>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon stat-green">

              ✓

            </div>


            <div>

              <span>

                Active Bookings

              </span>


              <strong>

                {activeReservationCount}

              </strong>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon stat-purple">

              ★

            </div>


            <div>

              <span>

                Completed Sessions

              </span>


              <strong>

                {completedReservationCount}

              </strong>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon stat-red">

              ×

            </div>


            <div>

              <span>

                Cancelled

              </span>


              <strong>

                {cancelledReservationCount}

              </strong>

            </div>

          </div>

        </section>


        {/* ===================================
            QUICK ACTIONS
        ==================================== */}

        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <div>

              <p>

                QUICK ACTIONS

              </p>


              <h2>

                What would you like to do?

              </h2>

            </div>

          </div>


          <div className="dashboard-actions-grid">


            <button
              className="dashboard-action-card action-primary"
              onClick={findSeat}
            >

              <div className="dashboard-action-icon">

                ▦

              </div>


              <div>

                <h3>

                  Find a Seat

                </h3>


                <p>

                  Browse available seats and
                  reserve your preferred study space.

                </p>

              </div>


              <span className="dashboard-action-arrow">

                →

              </span>

            </button>


            <button
              className="dashboard-action-card"
              onClick={viewReservations}
            >

              <div className="dashboard-action-icon">

                ◫

              </div>


              <div>

                <h3>

                  My Reservations

                </h3>


                <p>

                  View your active, completed
                  and previous reservations.

                </p>

              </div>


              <span className="dashboard-action-arrow">

                →

              </span>

            </button>


            <button
              className="dashboard-action-card"
              onClick={viewProfile}
            >

              <div className="dashboard-action-icon">

                ◉

              </div>


              <div>

                <h3>

                  My Profile

                </h3>


                <p>

                  Manage your account and
                  personal information.

                </p>

              </div>


              <span className="dashboard-action-arrow">

                →

              </span>

            </button>


            <button
              className="dashboard-action-card"
              onClick={getHelp}
            >

              <div className="dashboard-action-icon">

                ?

              </div>


              <div>

                <h3>

                  Help & Support

                </h3>


                <p>

                  Get help with your account,
                  reservations or library access.

                </p>

              </div>


              <span className="dashboard-action-arrow">

                →

              </span>

            </button>

          </div>

        </section>


        {/* ===================================
            LOWER GRID
        ==================================== */}

        <section className="dashboard-lower-grid">


          {/* =================================
              UPCOMING RESERVATION
          ================================== */}

          <div className="dashboard-reservation-panel">

            <div className="dashboard-panel-header">

              <div>

                <p>

                  YOUR NEXT SESSION

                </p>


                <h2>

                  Upcoming Reservation

                </h2>

              </div>


              <button
                onClick={viewReservations}
              >

                View all →

              </button>

            </div>


            {

              upcomingReservation

                ? (

                  <div className="dashboard-upcoming-card">


                    <div className="upcoming-seat-block">

                      <span>

                        SEAT

                      </span>


                      <strong>

                        {getSeatLabel(
                          upcomingReservation
                        )}

                      </strong>

                    </div>


                    <div className="upcoming-details">


                      <div>

                        <span>

                          Floor

                        </span>


                        <strong>

                          {getFloorLabel(
                            upcomingReservation
                          )}

                        </strong>

                      </div>


                      <div>

                        <span>

                          Date

                        </span>


                        <strong>

                          {formatDate(

                            upcomingReservation.date ||

                            upcomingReservation.startTime

                          )}

                        </strong>

                      </div>


                      <div>

                        <span>

                          Time

                        </span>


                        <strong>

                          {

                            upcomingReservation.startTime

                              ? `${formatTime(
                                  upcomingReservation.startTime
                                )} - ${formatTime(
                                  upcomingReservation.endTime
                                )}`

                              : (

                                  upcomingReservation.time ||

                                  upcomingReservation.selectedTime ||

                                  "Scheduled"

                                )

                          }

                        </strong>

                      </div>

                    </div>


                    <div
                      className={
                        `dashboard-status-pill ${getStatusClass(
                          upcomingReservation.status
                        )}`
                      }
                    >

                      {

                        upcomingReservation.status ||
                        "Booked"

                      }

                    </div>

                  </div>

                )

                : (

                  <div className="dashboard-empty-booking">

                    <div className="dashboard-empty-icon">

                      ▦

                    </div>


                    <h3>

                      No active reservation

                    </h3>


                    <p>

                      You do not have an upcoming
                      study session yet.

                    </p>


                    <button
                      onClick={findSeat}
                    >

                      Find a Seat →

                    </button>

                  </div>

                )

            }

          </div>


          {/* =================================
              ACTIVITY PANEL
          ================================== */}

          <div className="dashboard-activity-panel">

            <div className="dashboard-panel-header">

              <div>

                <p>

                  RECENT ACTIVITY

                </p>


                <h2>

                  Reservation History

                </h2>

              </div>

            </div>


            <div className="dashboard-activity-list">

              {

                reservations.length > 0

                  ? (

                    reservations
                      .slice(0, 5)
                      .map(
                        (
                          reservation,
                          index
                        ) => (

                          <div
                            className="dashboard-activity-item"
                            key={
                              reservation._id ||
                              reservation.id ||
                              index
                            }
                          >

                            <div className="activity-seat-icon">

                              {getSeatLabel(
                                reservation
                              )}

                            </div>


                            <div className="activity-content">

                              <strong>

                                Seat{" "}

                                {getSeatLabel(
                                  reservation
                                )}

                              </strong>


                              <span>

                                {

                                  formatDate(

                                    reservation.date ||

                                    reservation.startTime

                                  )

                                }

                              </span>

                            </div>


                            <div
                              className={
                                `activity-status ${getStatusClass(
                                  reservation.status
                                )}`
                              }
                            >

                              {

                                reservation.status ||
                                "Booked"

                              }

                            </div>

                          </div>

                        )
                      )

                  )

                  : (

                    <div className="dashboard-no-activity">

                      No reservation activity yet.

                    </div>

                  )

              }

            </div>


            {

              reservations.length > 0 && (

                <button
                  className="dashboard-history-button"
                  onClick={viewReservations}
                >

                  View Complete History

                </button>

              )

            }

          </div>

        </section>


        {/* ===================================
            STUDY TIP
        ==================================== */}

        <section className="dashboard-tip-card">

          <div className="dashboard-tip-icon">

            ✦

          </div>


          <div>

            <p>

              STUDY SMARTER

            </p>


            <h3>

              Reserve your preferred seat before
              arriving at the library.

            </h3>


            <span>

              Check in on time to keep your
              reservation active.

            </span>

          </div>


          <button
            onClick={goBooking}
          >

            Find a Seat →

          </button>

        </section>

      </main>


      {/* =====================================
          MOBILE BACK BUTTON
      ====================================== */}

      {

        goBack && (

          <button
            className="dashboard-floating-back"
            onClick={handleGoHome}
            title="Return to Home"
          >

            ←

          </button>

        )

      }

    </div>

  );

}


export default Dashboard;