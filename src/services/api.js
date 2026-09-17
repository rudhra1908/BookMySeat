/* =========================================
   API BASE URL
========================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";


/* =========================================
   REQUEST HELPER
========================================= */

async function request(
  endpoint,
  options = {}
) {

  const {

    method = "GET",

    token = null,

    body = null,

  } = options;


  /* =======================================
     REQUEST HEADERS
  ======================================= */

  const headers = {

    "Content-Type":
      "application/json",

  };


  /* =======================================
     AUTHORIZATION TOKEN
  ======================================= */

  if (
    token
  ) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  /* =======================================
     REQUEST CONFIGURATION
  ======================================= */

  const config = {

    method,

    headers,

  };


  /* =======================================
     REQUEST BODY
  ======================================= */

  if (

    body !== null &&

    body !== undefined

  ) {

    config.body =
      JSON.stringify(
        body
      );

  }


  /* =======================================
     API REQUEST
  ======================================= */

  let response;


  try {

    response =
      await fetch(

        `${API_BASE_URL}${endpoint}`,

        config

      );

  }

  catch (
    error
  ) {

    console.error(

      "Unable to connect to backend:",

      error

    );


    throw new Error(

      `Unable to connect to the server at ${API_BASE_URL}. Please check whether the backend is running.`

    );

  }


  /* =======================================
     RESPONSE DATA
  ======================================= */

  let data;


  try {

    data =
      await response.json();

  }

  catch (
    error
  ) {

    console.warn(

      "Server response was not valid JSON:",

      error

    );


    data =
      {};

  }


  /* =======================================
     HANDLE HTTP ERRORS
  ======================================= */

  if (
    !response.ok
  ) {

    throw new Error(

      data?.message ||

      data?.error ||

      `Request failed with status ${response.status}`

    );

  }


  /* =======================================
     RETURN RESPONSE
  ======================================= */

  return data;

}


/* =========================================
   API METHODS
========================================= */

export const api = {


  /* =======================================
     AUTH
  ======================================= */


  /* =======================================
     REGISTER USER

     Backend route:

     POST /api/auth/register
  ======================================= */

  register(
    userData
  ) {

    return request(

      "/auth/register",

      {

        method:
          "POST",

        body:
          userData,

      }

    );

  },


  /* =======================================
     LOGIN

     SAME API FOR:

     - STUDENT LOGIN
     - USER LOGIN
     - ADMIN LOGIN

     Backend route:

     POST /api/auth/login

     The backend checks the user's role.

     Example request:

     {
       email,
       password
     }

     The frontend can then check:

     response.user.role

     If role === "admin"
     → Open AdminDashboard

     Otherwise
     → Open Student Dashboard
  ======================================= */

  login(
    userData
  ) {

    return request(

      "/auth/login",

      {

        method:
          "POST",

        body:
          userData,

      }

    );

  },


  /* =======================================
     GET CURRENT USER PROFILE

     Backend route:

     GET /api/auth/me
  ======================================= */

  getProfile(
    token
  ) {

    return request(

      "/auth/me",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     SEATS
  ======================================= */


  /* =======================================
     GET ALL SEATS

     Backend route:

     GET /api/seats
  ======================================= */

  getSeats(
    token
  ) {

    return request(

      "/seats",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     GET SEAT AVAILABILITY

     Backend route:

     GET /api/seats/availability

     Required parameters:

     startTime
     endTime
  ======================================= */

  getSeatAvailability(

    startTime,

    endTime,

    token

  ) {

    const queryParameters =
      new URLSearchParams();


    queryParameters.set(

      "startTime",

      startTime

    );


    queryParameters.set(

      "endTime",

      endTime

    );


    return request(

      `/seats/availability?${queryParameters.toString()}`,

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     RESERVATIONS
  ======================================= */


  /* =======================================
     CREATE RESERVATION

     Backend route:

     POST /api/reservations

     Expected request body:

     {
       seatId,
       startTime,
       endTime
     }
  ======================================= */

  createReservation(

    reservationData,

    token

  ) {

    return request(

      "/reservations",

      {

        method:
          "POST",

        token,

        body:
          reservationData,

      }

    );

  },


  /* =======================================
     GET MY RESERVATIONS

     Backend route:

     GET /api/reservations/my
  ======================================= */

  getMyReservations(
    token
  ) {

    return request(

      "/reservations/my",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     CHECK IN RESERVATION

     Backend route:

     PUT /api/reservations/:id/checkin
  ======================================= */

  checkInReservation(

    reservationId,

    token

  ) {

    return request(

      `/reservations/${reservationId}/checkin`,

      {

        method:
          "PUT",

        token,

      }

    );

  },

  

    /* =======================================
     ADMIN QR CHECK-IN

     Backend route:

     PUT /api/admin/reservations/:id/checkin

     Admin scans a student's QR code.

     The backend verifies:
     - reservation exists
     - reservation is booked
     - reservation is not cancelled
     - reservation is not completed
     - check-in time is valid
  ======================================= */

  adminCheckInReservation(

    reservationId,

    token

  ) {

    return request(

      `/admin/reservations/${reservationId}/checkin`,

      {

        method:
          "PUT",

        token,

      }

    );

  },

    /* =======================================
     ADMIN CHECK-IN RESERVATION

     Admin scans student's BookingPass QR.

     Backend route:

     PUT /api/admin/reservations/:id/checkin

     Requires:

     - Valid JWT token
     - Admin role

     The backend verifies the actual
     reservation and check-in window.

     The QR code itself is NOT trusted
     for the reservation status.
  ======================================= */

  adminCheckInReservation(

    reservationId,

    token

  ) {

    return request(

      `/admin/reservations/${reservationId}/checkin`,

      {

        method:
          "PUT",

        token,

      }

    );

  },


  /* =======================================
     COMPLETE / CHECK OUT RESERVATION

     Backend route:

     PUT /api/reservations/:id/complete
  ======================================= */

  completeReservation(

    reservationId,

    token

  ) {

    return request(

      `/reservations/${reservationId}/complete`,

      {

        method:
          "PUT",

        token,

      }

    );

  },


  /* =======================================
     CANCEL RESERVATION

     Backend route:

     PUT /api/reservations/:id/cancel
  ======================================= */

  cancelReservation(

    reservationId,

    token

  ) {

    return request(

      `/reservations/${reservationId}/cancel`,

      {

        method:
          "PUT",

        token,

      }

    );

  },


  /* =======================================
     GET RESERVATION STATUS

     Backend route:

     GET /api/reservations/:id/status
  ======================================= */

  getReservationStatus(

    reservationId,

    token

  ) {

    return request(

      `/reservations/${reservationId}/status`,

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     GET SINGLE RESERVATION

     Backend route:

     GET /api/reservations/:id
  ======================================= */

  getReservationById(

    reservationId,

    token

  ) {

    return request(

      `/reservations/${reservationId}`,

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     ADMIN DASHBOARD

     Backend route:

     GET /api/admin/dashboard

     Requires:

     - Valid JWT token
     - Admin role
  ======================================= */

  getAdminDashboard(
    token
  ) {

    return request(

      "/admin/dashboard",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     ADMIN USERS

     Backend route:

     GET /api/admin/users

     Requires:

     - Valid JWT token
     - Admin role
  ======================================= */

  getAdminUsers(
    token
  ) {

    return request(

      "/admin/users",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     ADMIN USER STATUS

     Backend route:

     PUT /api/admin/users/:id/status

     Request body:

     {
       isActive: true
     }

     OR

     {
       isActive: false
     }
  ======================================= */

  updateAdminUserStatus(

    userId,

    isActive,

    token

  ) {

    return request(

      `/admin/users/${userId}/status`,

      {

        method:
          "PUT",

        token,

        body: {

          isActive,

        },

      }

    );

  },


  /* =======================================
     ADMIN RESERVATIONS

     Backend route:

     GET /api/admin/reservations

     This can return all reservations
     including student and seat details.

     Requires:

     - Valid JWT token
     - Admin role
  ======================================= */

  getAdminReservations(
    token
  ) {

    return request(

      "/admin/reservations",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     ADMIN CANCEL RESERVATION

     Backend route:

     PUT /api/admin/reservations/:id/cancel

     Requires:

     - Valid JWT token
     - Admin role
  ======================================= */

  cancelAdminReservation(

    reservationId,

    token

  ) {

    return request(

      `/admin/reservations/${reservationId}/cancel`,

      {

        method:
          "PUT",

        token,

      }

    );

  },


  /* =======================================
     ADMIN SEATS

     Backend route:

     GET /api/admin/seats

     Requires:

     - Valid JWT token
     - Admin role
  ======================================= */

  getAdminSeats(
    token
  ) {

    return request(

      "/admin/seats",

      {

        method:
          "GET",

        token,

      }

    );

  },


  /* =======================================
     UPDATE ADMIN SEAT

     Backend route:

     PUT /api/admin/seats/:id

     Example seatData:

     {
       seatNumber,
       floor,
       status,
       isActive
     }
  ======================================= */

  updateAdminSeat(

    seatId,

    seatData,

    token

  ) {

    return request(

      `/admin/seats/${seatId}`,

      {

        method:
          "PUT",

        token,

        body:
          seatData,

      }

    );

  },


  /* =======================================
     CREATE ADMIN SEAT

     Backend route:

     POST /api/admin/seats

     Example seatData:

     {
       seatNumber,
       floor
     }
  ======================================= */

  createAdminSeat(

    seatData,

    token

  ) {

    return request(

      "/admin/seats",

      {

        method:
          "POST",

        token,

        body:
          seatData,

      }

    );

  },


  /* =======================================
     DELETE ADMIN SEAT

     Backend route:

     DELETE /api/admin/seats/:id

     Requires:

     - Valid JWT token
     - Admin role
  ======================================= */

  deleteAdminSeat(

    seatId,

    token

  ) {

    return request(

      `/admin/seats/${seatId}`,

      {

        method:
          "DELETE",

        token,

      }

    );

  },


  /* =======================================
     GENERIC API REQUEST

     This is optional but useful if
     another component needs to call
     a new backend endpoint without
     immediately creating a dedicated
     method above.

     Example:

     api.custom(
       "/some-route",
       {
         method: "GET",
         token
       }
     );
  ======================================= */

  custom(

    endpoint,

    options = {}

  ) {

    return request(

      endpoint,

      options

    );

  },

};