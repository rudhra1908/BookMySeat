import {
  useEffect,
  useState,
  useCallback,
} from "react";

import SeatExplorer from "./SeatExplorer";
import BookingSuccess from "./BookingSuccess";
import MyReservations from "./MyReservations";

import Login from "./login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import HelpSupport from "./HelpSupport";

import AdminDashboard from "./AdminDashboard";

import { api } from "./services/api";

import {
  useAuth,
} from "./AuthContext";


function App() {


  /* =========================================
     AUTH CONTEXT

     IMPORTANT:

     User and token are managed from one place.

     This prevents duplicate user states and
     prevents repeated dashboard loading.
  ========================================= */

  const {

    user,

    token,

    login,

    logout,

    updateUser,

  } = useAuth();


  /* =========================================
     BASIC STATES
  ========================================= */

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState("home");


  const [
    pageHistory,
    setPageHistory,
  ] =
    useState([]);


  const [
    booking,
    setBooking,
  ] =
    useState(null);


  const [
    reservations,
    setReservations,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  /* =========================================
     NAVIGATION
  ========================================= */

  const navigateTo =
    (
      page
    ) => {

      setPageHistory(
        (
          previousHistory
        ) => {


          if (

            previousHistory[
              previousHistory.length - 1
            ] === currentPage

          ) {

            return previousHistory;

          }


          return [

            ...previousHistory,

            currentPage,

          ];

        }
      );


      setCurrentPage(
        page
      );

    };


  /* =========================================
     GO BACK
  ========================================= */

  const goBack =
    () => {

      setPageHistory(
        (
          previousHistory
        ) => {


          if (
            previousHistory.length === 0
          ) {


            if (
              user
            ) {


              if (
                user.role === "admin"
              ) {

                setCurrentPage(
                  "admin"
                );

              }

              else {

                setCurrentPage(
                  "dashboard"
                );

              }


            }

            else {

              setCurrentPage(
                "home"
              );

            }


            return previousHistory;

          }


          const updatedHistory =
            [
              ...previousHistory,
            ];


          const previousPage =
            updatedHistory.pop();


          setCurrentPage(
            previousPage
          );


          return updatedHistory;

        }
      );

    };


  /* =========================================
     GO HOME PAGE
  ========================================= */

  const goHomePage =
    () => {


      setPageHistory(
        []
      );


      if (
        user
      ) {


        if (
          user.role === "admin"
        ) {

          setCurrentPage(
            "admin"
          );

        }

        else {

          setCurrentPage(
            "dashboard"
          );

        }


      }

      else {

        setCurrentPage(
          "home"
        );

      }

    };


  /* =========================================
     FETCH USER PROFILE

     IMPORTANT:

     This callback only depends on token.

     Do NOT add user.name or user.role here.

     Adding user dependencies can cause:

     fetch profile
     →
     update user
     →
     component render
     →
     callback recreated
     →
     fetch profile again

     This was one possible reason for the
     blinking loading effect.
  ========================================= */

  const fetchUserProfile =
    useCallback(
      async () => {


        if (
          !token
        ) {

          return;

        }


        try {


          const data =
            await api.getProfile(
              token
            );


          const profileUser =

            data?.user ||

            data?.data ||

            data;


          if (

            profileUser &&

            typeof profileUser ===
              "object"

          ) {


            const finalUser = {

              ...profileUser,


              name:

                profileUser.name ||

                profileUser.firstName ||

                "Student",


              role:

                profileUser.role ||

                "user",

            };


            /* ===============================
               UPDATE AUTH CONTEXT
            =============================== */

            updateUser(
              finalUser
            );

          }


        }

        catch (
          error
        ) {


          console.error(

            "Error fetching user profile:",

            error

          );


        }


      },
      [

        token,

        updateUser,

      ]
    );


  /* =========================================
     FETCH RESERVATIONS

     ADMIN DOES NOT NEED STUDENT
     RESERVATIONS ON LOGIN.

     So reservations are fetched only
     for normal users.
  ========================================= */

  const fetchReservations =
    useCallback(
      async () => {


        if (
          !token
        ) {


          setReservations(
            []
          );


          return;

        }


        if (
          user?.role === "admin"
        ) {


          setReservations(
            []
          );


          return;

        }


        try {


          setLoading(
            true
          );


          const data =
            await api.getMyReservations(
              token
            );


          const fetchedReservations =

            data?.reservations ||

            data?.data ||

            data ||

            [];


          const reservationArray =

            Array.isArray(
              fetchedReservations
            )

              ? fetchedReservations

              : [];


          const formattedReservations =

            reservationArray.map(
              (
                reservation
              ) => ({

                ...reservation,


                id:

                  reservation._id ||

                  reservation.id,


                reservationId:

                  reservation.reservationId ||

                  reservation._id ||

                  reservation.id,


                seat:

                  reservation.seat,


                seatNumber:

                  reservation.seatNumber ||

                  reservation?.seat?.seatNumber ||

                  reservation?.seat?.number,


                startTime:

                  reservation.startTime,


                endTime:

                  reservation.endTime,


                date:

                  reservation.date ||

                  reservation.startTime,


                time:

                  reservation.time,


                floor:

                  reservation.floor ||

                  reservation?.seat?.floor,


                status:

                  reservation.status ||

                  "Booked",

              })
            );


          setReservations(
            formattedReservations
          );


        }

        catch (
          error
        ) {


          console.error(

            "Error fetching reservations:",

            error

          );


          setReservations(
            []
          );


        }

        finally {


          setLoading(
            false
          );


        }


      },
      [

        token,

        user?.role,

      ]
    );


  /* =========================================
     LOAD USER PROFILE

     Runs when token changes.

     It does NOT continuously run whenever
     the user object changes.
  ========================================= */

  useEffect(
    () => {


      if (
        token
      ) {

        fetchUserProfile();

      }


    },
    [

      token,

      fetchUserProfile,

    ]
  );


  /* =========================================
     LOAD RESERVATIONS

     Runs for authenticated normal users.

     Admin users do not trigger student
     reservation loading.
  ========================================= */

  useEffect(
    () => {


      if (

        token &&

        user &&

        user.role !== "admin"

      ) {

        fetchReservations();

      }


      else if (
        !token
      ) {

        setReservations(
          []
        );

      }


    },
    [

      token,

      user?.role,

      fetchReservations,

    ]
  );


  /* =========================================
     AUTO REDIRECT AFTER LOGIN

     ADMIN
     -----
     Admin Dashboard

     USER
     ----
     Student Dashboard
  ========================================= */

  useEffect(
    () => {


      if (
        !user
      ) {

        return;

      }


      if (

        user.role === "admin" &&

        (

          currentPage === "home" ||

          currentPage === "dashboard"

        )

      ) {

        setCurrentPage(
          "admin"
        );

      }


    },
    [

      user?.role,

      currentPage,

    ]
  );


  /* =========================================
     LOGIN SUCCESS
  ========================================= */

  const handleLogin =
    (
      userData
    ) => {


      const receivedUser =

        userData?.user ||

        userData ||

        {

          name:
            "Student",

        };


      const finalUser = {

        ...receivedUser,


        name:

          receivedUser?.name ||

          `${

            receivedUser?.firstName ||
            ""

          } ${

            receivedUser?.lastName ||
            ""

          }`
            .trim() ||

          "Student",


        role:

          receivedUser?.role ||

          "user",

      };


      /* =====================================
         IMPORTANT

         Login.jsx already saves the token
         and user using AuthContext login().

         This update ensures App.jsx also
         receives the latest user data.
      ===================================== */

      updateUser(
        finalUser
      );


      setPageHistory(
        []
      );


      /* =====================================
         ADMIN LOGIN
      ===================================== */

      if (

        finalUser.role ===
        "admin"

      ) {


        setCurrentPage(
          "admin"
        );


      }


      /* =====================================
         STUDENT LOGIN
      ===================================== */

      else {


        setCurrentPage(
          "dashboard"
        );


      }


    };


  /* =========================================
     REGISTER SUCCESS
  ========================================= */

  const handleRegister =
    (
      userData
    ) => {


      const receivedUser =

        userData?.user ||

        userData ||

        {};


      const finalUser = {

        ...receivedUser,


        name:

          receivedUser?.name ||

          `${

            receivedUser?.firstName ||
            ""

          } ${

            receivedUser?.lastName ||
            ""

          }`
            .trim() ||

          "Student",


        role:

          receivedUser?.role ||

          "user",

      };


      /* =====================================
         UPDATE AUTH USER
      ===================================== */

      updateUser(
        finalUser
      );


      setPageHistory(
        []
      );


      /* =====================================
         PUBLIC REGISTRATION

         New users are normal users.
      ===================================== */

      setCurrentPage(
        "dashboard"
      );


    };


  /* =========================================
     REAL LOGOUT

     This calls AuthContext logout().

     AuthContext removes:

     - token
     - bookmyseat_user

     Then the application state is reset.
  ========================================= */

  const handleLogout =
    () => {


      /* ===============================
         REAL AUTH LOGOUT
      =============================== */

      logout();


      /* ===============================
         CLEAR APP DATA
      =============================== */

      setBooking(
        null
      );


      setReservations(
        []
      );


      setPageHistory(
        []
      );


      setLoading(
        false
      );


      /* ===============================
         RETURN TO HOME
      =============================== */

      setCurrentPage(
        "home"
      );


    };


  /* =========================================
     SWITCH ACCOUNT
  ========================================= */

  const handleSwitchAccount =
    () => {


      /* ===============================
         CLEAR AUTH
      =============================== */

      logout();


      /* ===============================
         CLEAR APP DATA
      =============================== */

      setBooking(
        null
      );


      setReservations(
        []
      );


      setPageHistory(
        []
      );


      setLoading(
        false
      );


      /* ===============================
         GO TO LOGIN
      =============================== */

      setCurrentPage(
        "login"
      );


    };


  /* =========================================
     FORGOT PASSWORD
  ========================================= */

  const handleForgotPassword =
    (
      email
    ) => {


      console.log(

        "Password reset requested for:",

        email

      );


    };


  /* =========================================
     BOOKING SUCCESS
  ========================================= */

  const handleBookingSuccess =
    async (
      reservation
    ) => {


      if (
        !reservation
      ) {


        console.error(
          "No reservation received"
        );


        return;

      }


      const newBooking = {

        ...reservation,


        id:

          reservation._id ||

          reservation.id,


        reservationId:

          reservation.reservationId ||

          reservation._id ||

          reservation.id,


        seat:

          reservation.seat,


        selectedSeat:

          reservation.selectedSeat,


        startTime:

          reservation.startTime,


        endTime:

          reservation.endTime,


        date:

          reservation.date ||

          reservation.selectedDate ||

          reservation.startTime,


        time:

          reservation.time ||

          reservation.selectedTime,


        floor:

          reservation.floor ||

          reservation.selectedFloor ||

          reservation?.seat?.floor,


        status:

          reservation.status ||

          "Booked",

      };


      setBooking(
        newBooking
      );


      setReservations(
        (
          previousReservations
        ) => [

          newBooking,


          ...previousReservations.filter(
            (
              item
            ) =>


              String(

                item._id ||

                item.id

              ) !==


              String(

                newBooking._id ||

                newBooking.id

              )

          ),

        ]
      );


      setPageHistory([
        "dashboard",
      ]);


      setCurrentPage(
        "success"
      );


      if (
        token
      ) {


        try {


          await fetchReservations();


        }

        catch (
          error
        ) {


          console.error(

            "Failed to refresh reservations:",

            error

          );


        }


      }


    };


  /* =========================================
     CANCEL RESERVATION
  ========================================= */

  const cancelReservation =
    async (
      id
    ) => {


      try {


        setLoading(
          true
        );


        const data =
          await api.cancelReservation(

            id,

            token

          );


        const updatedReservation =

          data?.reservation ||

          data;


        setReservations(
          (
            previousReservations
          ) =>


            previousReservations.map(
              (
                reservation
              ) => {


                const reservationId =

                  reservation._id ||

                  reservation.id;


                return (

                  String(
                    reservationId
                  ) ===

                  String(
                    id
                  )

                    ? {

                        ...reservation,

                        ...updatedReservation,


                        id:

                          updatedReservation?._id ||

                          updatedReservation?.id ||

                          reservationId,

                      }

                    : reservation

                );


              }
            )

        );


        if (

          booking &&


          String(

            booking._id ||

            booking.id

          ) ===

          String(
            id
          )

        ) {


          setBooking(
            (
              previousBooking
            ) => ({

              ...previousBooking,

              ...updatedReservation,


              id:

                updatedReservation?._id ||

                updatedReservation?.id ||

                previousBooking.id,

            })
          );


        }


        await fetchReservations();


      }

      catch (
        error
      ) {


        console.error(
          "Error cancelling reservation:",
          error
        );


        throw error;


      }

      finally {


        setLoading(
          false
        );


      }


    };


  /* =========================================
     CHECK IN RESERVATION
  ========================================= */

  const checkInReservation =
    async (
      id
    ) => {


      try {


        setLoading(
          true
        );


        const data =
          await api.checkInReservation(

            id,

            token

          );


        const updatedReservation =

          data?.reservation ||

          data;


        setReservations(
          (
            previousReservations
          ) =>


            previousReservations.map(
              (
                reservation
              ) =>


                String(

                  reservation._id ||

                  reservation.id

                ) ===

                String(
                  id
                )

                  ? {

                      ...reservation,

                      ...updatedReservation,


                      id:

                        updatedReservation?._id ||

                        updatedReservation?.id ||

                        reservation.id,

                    }

                  : reservation

            )

        );


        await fetchReservations();


      }

      catch (
        error
      ) {


        console.error(
          "Error checking in:",
          error
        );


        throw error;


      }

      finally {


        setLoading(
          false
        );


      }


    };


  /* =========================================
     COMPLETE RESERVATION

     CHECK OUT
  ========================================= */

  const completeReservation =
    async (
      id
    ) => {


      try {


        setLoading(
          true
        );


        const data =
          await api.completeReservation(

            id,

            token

          );


        const updatedReservation =

          data?.reservation ||

          data;


        setReservations(
          (
            previousReservations
          ) =>


            previousReservations.map(
              (
                reservation
              ) =>


                String(

                  reservation._id ||

                  reservation.id

                ) ===

                String(
                  id
                )

                  ? {

                      ...reservation,

                      ...updatedReservation,


                      id:

                        updatedReservation?._id ||

                        updatedReservation?.id ||

                        reservation.id,

                    }

                  : reservation

            )

        );


        await fetchReservations();


      }

      catch (
        error
      ) {


        console.error(
          "Error completing reservation:",
          error
        );


        throw error;


      }

      finally {


        setLoading(
          false
        );


      }


    };


  /* =========================================
     LOGIN PAGE
  ========================================= */

  if (
    currentPage === "login"
  ) {


    return (

      <Login

        loginSuccess={
          handleLogin
        }

        onLogin={
          handleLogin
        }

        goHome={() => {


          setPageHistory(
            []
          );


          setCurrentPage(
            "home"
          );


        }}

        goRegister={() => {


          setPageHistory(
            []
          );


          setCurrentPage(
            "register"
          );


        }}

      />

    );


  }


  /* =========================================
     REGISTER PAGE
  ========================================= */

  if (
    currentPage === "register"
  ) {


    return (

      <Register

        registerSuccess={
          handleRegister
        }

        onRegister={
          handleRegister
        }

        goHome={() => {


          setPageHistory(
            []
          );


          setCurrentPage(
            "home"
          );


        }}

        goLogin={() => {


          setPageHistory(
            []
          );


          setCurrentPage(
            "login"
          );


        }}

      />

    );


  }


  /* =========================================
     ADMIN DASHBOARD
  ========================================= */

  if (
    currentPage === "admin"
  ) {


    /* ===============================
       NOT LOGGED IN
    =============================== */

    if (
      !user
    ) {


      setTimeout(
        () => {


          setCurrentPage(
            "login"
          );


        },
        0
      );


      return (

        <div className="global-loader">

          Checking admin access...

        </div>

      );


    }


    /* ===============================
       USER IS NOT ADMIN
    =============================== */

    if (
      user.role !== "admin"
    ) {


      setTimeout(
        () => {


          setCurrentPage(
            "dashboard"
          );


        },
        0
      );


      return (

        <div className="global-loader">

          Checking admin access...

        </div>

      );


    }


    /* ===============================
       ADMIN DASHBOARD
    =============================== */

    return (

      <AdminDashboard

        user={
          user
        }

        token={
          token
        }

        goHome={() => {


          setPageHistory(
            []
          );


          setCurrentPage(
            "home"
          );


        }}

        goDashboard={() => {


          setPageHistory(
            []
          );


          setCurrentPage(
            "admin"
          );


        }}

        goBack={
          goBack
        }

        logout={
          handleLogout
        }

      />

    );


  }


  /* =========================================
     STUDENT DASHBOARD
  ========================================= */

  if (
    currentPage === "dashboard"
  ) {


    /* ===============================
       PROTECT DASHBOARD
    =============================== */

    if (
      !user
    ) {


      setTimeout(
        () => {


          setCurrentPage(
            "login"
          );


        },
        0
      );


      return (

        <div className="global-loader">

          Checking authentication...

        </div>

      );


    }


    /* ===============================
       REDIRECT ADMIN
    =============================== */

    if (
      user.role === "admin"
    ) {


      setTimeout(
        () => {


          setCurrentPage(
            "admin"
          );


        },
        0
      );


      return (

        <div className="global-loader">

          Opening admin dashboard...

        </div>

      );


    }


    return (

      <>

        {loading && (

          <div className="global-loader">

            Loading your dashboard...

          </div>

        )}


        <Dashboard

          user={
            user
          }

          reservations={
            reservations
          }


          goBack={
            goBack
          }


          goHome={() => {


            setPageHistory(
              []
            );


            setCurrentPage(
              "home"
            );


          }}


          goBooking={() => {


            navigateTo(
              "seats"
            );


          }}


          goReservations={() => {


            navigateTo(
              "reservations"
            );


          }}


          goProfile={() => {


            navigateTo(
              "profile"
            );


          }}


          goHelpSupport={() => {


            navigateTo(
              "help"
            );


          }}


          findSeat={() => {


            navigateTo(
              "seats"
            );


          }}


          viewReservations={() => {


            navigateTo(
              "reservations"
            );


          }}


          viewProfile={() => {


            navigateTo(
              "profile"
            );


          }}


          getHelp={() => {


            navigateTo(
              "help"
            );


          }}


          logout={
            handleLogout
          }

        />

      </>

    );


  }


  /* =========================================
     PROFILE
  ========================================= */

  if (
    currentPage === "profile"
  ) {


    if (
      !user
    ) {


      setTimeout(
        () => {


          setCurrentPage(
            "login"
          );


        },
        0
      );


      return (

        <div className="global-loader">

          Checking authentication...

        </div>

      );


    }


    return (

      <Profile

        user={
          user
        }

        updateUser={
          (
            updatedUser
          ) => {


            const finalUser = {

              ...updatedUser,


              name:

                updatedUser?.name ||

                updatedUser?.firstName ||

                user?.name ||

                "Student",


              role:

                updatedUser?.role ||

                user?.role ||

                "user",

            };


            updateUser(
              finalUser
            );


          }
        }

        goHome={
          goBack
        }

        goDashboard={() => {


          navigateTo(

            user?.role === "admin"

              ? "admin"

              : "dashboard"

          );


        }}

        goReservations={() => {


          navigateTo(
            "reservations"
          );


        }}

        goSeats={() => {


          navigateTo(
            "seats"
          );


        }}

        goSupport={() => {


          navigateTo(
            "help"
          );


        }}

        forgotPassword={
          handleForgotPassword
        }

        switchAccount={
          handleSwitchAccount
        }

        logout={
          handleLogout
        }

      />

    );


  }


  /* =========================================
     HELP & SUPPORT
  ========================================= */

  if (
    currentPage === "help"
  ) {


    return (

      <HelpSupport

        user={
          user
        }

        goHome={
          goBack
        }

        goDashboard={() => {


          if (
            user?.role === "admin"
          ) {


            navigateTo(
              "admin"
            );


          }

          else {


            navigateTo(
              "dashboard"
            );


          }


        }}

        goSeats={() => {


          navigateTo(
            "seats"
          );


        }}

        goReservations={() => {


          navigateTo(
            "reservations"
          );


        }}

        goProfile={() => {


          navigateTo(
            "profile"
          );


        }}

        findSeat={() => {


          navigateTo(
            "seats"
          );


        }}

        viewReservations={() => {


          navigateTo(
            "reservations"
          );


        }}

        viewProfile={() => {


          navigateTo(
            "profile"
          );


        }}

        logout={
          handleLogout
        }

      />

    );


  }


  /* =========================================
     SEAT EXPLORER
  ========================================= */

  if (
    currentPage === "seats"
  ) {


    return (

      <>

        {loading && (

          <div className="global-loader">

            Processing...

          </div>

        )}


        <SeatExplorer

          goHome={
            goBack
          }

          reservations={
            reservations
          }

          bookingSuccess={
            handleBookingSuccess
          }

        />

      </>

    );


  }


  /* =========================================
     BOOKING SUCCESS
  ========================================= */

  if (

    currentPage === "success" &&

    booking

  ) {


    return (

      <BookingSuccess

        booking={
          booking
        }

        goHome={() => {


          setPageHistory(
            []
          );


          goHomePage();


        }}

        bookAnother={() => {


          navigateTo(
            "seats"
          );


        }}

        viewReservations={() => {


          fetchReservations();


          navigateTo(
            "reservations"
          );


        }}

      />

    );


  }


  /* =========================================
     MY RESERVATIONS
  ========================================= */

  if (
    currentPage === "reservations"
  ) {


    return (

      <>

        {loading && (

          <div className="global-loader">

            Processing...

          </div>

        )}


        <MyReservations

          reservations={
            reservations
          }

          goHome={
            goBack
          }

          bookAnother={() => {


            navigateTo(
              "seats"
            );


          }}

          cancelReservation={
            cancelReservation
          }

          checkInReservation={
            checkInReservation
          }

          completeReservation={
            completeReservation
          }

          viewPass={
            (
              reservation
            ) => {


              setBooking(
                reservation
              );


              navigateTo(
                "success"
              );


            }
          }

        />

      </>

    );


  }


  /* =========================================
     HOME PAGE
  ========================================= */

  return (

    <div className="home-page">


      <div className="home-grid"></div>


      <div className="home-orb home-orb-one"></div>


      <div className="home-orb home-orb-two"></div>


      {/* =====================================
         NAVBAR
      ===================================== */}

      <nav className="home-navbar">


        <button
          className="home-brand"
          onClick={() => {


            setPageHistory(
              []
            );


            setCurrentPage(
              "home"
            );


          }}
        >


          <div className="brand-icon">

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


        <div className="home-nav-links">


          <button
            onClick={() => {


              setCurrentPage(
                "home"
              );


            }}
          >

            Home

          </button>


          <button
            onClick={() => {


              navigateTo(
                "seats"
              );


            }}
          >

            Find a Seat

          </button>


          <button
            onClick={() => {


              navigateTo(
                "help"
              );


            }}
          >

            Help

          </button>


        </div>


        <div className="home-nav-actions">


          {user ? (

            <>


              <button
                className="nav-dashboard-btn"
                onClick={() => {


                  navigateTo(

                    user.role === "admin"

                      ? "admin"

                      : "dashboard"

                  );


                }}
              >


                {

                  user.role === "admin"

                    ? "Admin Panel"

                    : "Dashboard"

                }

              </button>


              <button
                className="nav-avatar"
                onClick={() => {


                  navigateTo(
                    "profile"
                  );


                }}
                title="My Profile"
              >


                {

                  user.name

                    ? user.name
                        .charAt(0)
                        .toUpperCase()

                    : user.firstName

                      ? user.firstName
                          .charAt(0)
                          .toUpperCase()

                      : "U"

                }

              </button>


              <button
                className="nav-login-btn"
                onClick={
                  handleLogout
                }
              >

                Logout

              </button>


            </>

          ) : (

            <>


              <button
                className="nav-login-btn"
                onClick={() => {


                  navigateTo(
                    "login"
                  );


                }}
              >

                Log in

              </button>


              <button
                className="nav-register-btn"
                onClick={() => {


                  navigateTo(
                    "register"
                  );


                }}
              >

                Get Started →

              </button>


            </>

          )}


        </div>


      </nav>


      {/* =====================================
         HERO
      ===================================== */}

      <main className="home-hero">


        <div className="hero-left">


          <div className="hero-pill">

            <span></span>

            SMART LIBRARY RESERVATION

          </div>


          <h1>

            Your perfect study

            <br />

            <span>

              space is waiting.

            </span>

          </h1>


          <p className="hero-description">

            Stop searching for an empty seat.
            View real-time availability, choose
            your preferred study space and reserve
            it in seconds.

          </p>


          <div className="hero-actions">


            <button
              className="hero-primary-btn"
              onClick={() => {


                navigateTo(
                  "seats"
                );


              }}
            >

              Find a Seat

              <span>

                →

              </span>

            </button>


            <button
              className="hero-secondary-btn"
              onClick={() => {


                if (
                  !user
                ) {


                  setCurrentPage(
                    "login"
                  );


                  return;

                }


                if (
                  user.role === "admin"
                ) {


                  setCurrentPage(
                    "admin"
                  );


                }

                else {


                  setCurrentPage(
                    "dashboard"
                  );


                }


              }}
            >


              {

                user

                  ? (

                      user.role === "admin"

                        ? "Open Admin Panel"

                        : "Open Dashboard"

                    )

                  : "Student Login"

              }

            </button>


          </div>


          <div className="hero-stats">


            <div>

              <strong>

                24/7

              </strong>


              <span>

                Seat access

              </span>

            </div>


            <div className="stat-line"></div>


            <div>

              <strong>

                Live

              </strong>


              <span>

                Availability

              </span>

            </div>


            <div className="stat-line"></div>


            <div>

              <strong>

                Fast

              </strong>


              <span>

                Reservations

              </span>

            </div>


          </div>


        </div>


        {/* =====================================
           HERO VISUAL
        ===================================== */}

        <div className="hero-visual">


          <div className="hero-card-glow"></div>


          <div className="live-seat-card">


            <div className="live-card-top">


              <div>


                <span className="card-label">

                  LIVE AVAILABILITY

                </span>


                <h3>

                  Study Spaces

                </h3>


              </div>


              <div className="live-indicator">

                <span></span>

                LIVE

              </div>


            </div>


            <div className="seat-preview-grid">


              <div className="preview-seat available">

                A01

              </div>


              <div className="preview-seat available">

                A02

              </div>


              <div className="preview-seat occupied">

                A03

              </div>


              <div className="preview-seat available">

                A04

              </div>


              <div className="preview-seat selected">

                A05

              </div>


              <div className="preview-seat occupied">

                A06

              </div>


              <div className="preview-seat available">

                A07

              </div>


              <div className="preview-seat available">

                A08

              </div>


            </div>


            <div className="live-card-footer">


              <div className="availability-info">


                <span className="availability-dot"></span>


                <div>


                  <strong>

                    Seats available

                  </strong>


                  <small>

                    Select your preferred space

                  </small>


                </div>


              </div>


              <button
                onClick={() => {


                  navigateTo(
                    "seats"
                  );


                }}
              >

                Explore →

              </button>


            </div>


          </div>


          <div className="floating-card floating-card-one">


            <span>

              ✓

            </span>


            <div>


              <strong>

                Booking confirmed

              </strong>


              <small>

                Your seat is secured

              </small>


            </div>


          </div>


          <div className="floating-card floating-card-two">


            <div className="mini-avatar">


              {

                user?.name

                  ? user.name
                      .charAt(0)
                      .toUpperCase()

                  : user?.firstName

                    ? user.firstName
                        .charAt(0)
                        .toUpperCase()

                    : "S"

              }

            </div>


            <div>


              <small>

                SMART ACCESS

              </small>


              <strong>

                Ready to study

              </strong>


            </div>


          </div>


        </div>


      </main>


      {/* =====================================
         FEATURES
      ===================================== */}

      <section className="home-features">


        <div className="section-heading">


          <p>

            WHY BOOKMYSEAT

          </p>


          <h2>

            A simpler way to find
            your study space.

          </h2>


        </div>


        <div className="feature-grid">


          <div className="feature-card">


            <div className="feature-icon">

              ◉

            </div>


            <h3>

              Live Availability

            </h3>


            <p>

              Instantly see which seats are
              available before entering the library.

            </p>


          </div>


          <div className="feature-card">


            <div className="feature-icon">

              ◫

            </div>


            <h3>

              Choose Your Seat

            </h3>


            <p>

              Select your preferred seat,
              floor and study environment.

            </p>


          </div>


          <div className="feature-card">


            <div className="feature-icon">

              ✓

            </div>


            <h3>

              Digital Reservation

            </h3>


            <p>

              Receive a digital reservation pass
              and manage your booking easily.

            </p>


          </div>


        </div>


      </section>


      {/* =====================================
         HOW IT WORKS
      ===================================== */}

      <section className="how-it-works">


        <div className="section-heading">


          <p>

            HOW IT WORKS

          </p>


          <h2>

            From searching to studying
            in three simple steps.

          </h2>


        </div>


        <div className="steps-grid">


          <div className="step-card">


            <span className="step-number">

              01

            </span>


            <h3>

              Find a seat

            </h3>


            <p>

              Browse the library map and check
              real-time seat availability.

            </p>


          </div>


          <div className="step-connector">

            →

          </div>


          <div className="step-card">


            <span className="step-number">

              02

            </span>


            <h3>

              Reserve your slot

            </h3>


            <p>

              Choose your preferred date,
              time slot and study seat.

            </p>


          </div>


          <div className="step-connector">

            →

          </div>


          <div className="step-card">


            <span className="step-number">

              03

            </span>


            <h3>

              Check in & study

            </h3>


            <p>

              Use your digital reservation pass
              and enjoy your study session.

            </p>


          </div>


        </div>


      </section>


      {/* =====================================
         FINAL CTA
      ===================================== */}

      <section className="home-final-cta">


        <div className="final-cta-glow"></div>


        <p>

          READY TO GET STARTED?

        </p>


        <h2>

          Your next study session

          <br />

          starts with one click.

        </h2>


        <button
          onClick={() => {


            navigateTo(
              "seats"
            );


          }}
        >

          Find your seat

          <span>

            →

          </span>

        </button>


      </section>


      {/* =====================================
         FOOTER
      ===================================== */}

      <footer className="home-footer">


        <div>


          <strong>

            BookMySeat

          </strong>


          <span>

            Smart Library Reservation System

          </span>


        </div>


        <div className="footer-links">


          <button
            onClick={() => {


              navigateTo(
                "help"
              );


            }}
          >

            Help & Support

          </button>


          <button
            onClick={() => {


              if (
                user
              ) {


                navigateTo(
                  "profile"
                );


              }

              else {


                navigateTo(
                  "login"
                );


              }


            }}
          >

            Profile

          </button>


        </div>


      </footer>


    </div>

  );


}


export default App;