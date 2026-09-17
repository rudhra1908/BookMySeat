import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Ban,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DoorOpen,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ScanLine,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCircle,
  Users,
  X,
  XCircle,
} from "lucide-react";

import "./AdminDashboard.css";

import { useAuth } from "./AuthContext";

import { api } from "./services/api";

import QRScanner from "./QRScanner";

/* =========================================
   ADMIN DASHBOARD
========================================= */

function AdminDashboard({
  onBack,
  goHome,
}) {


  /* =====================================
     AUTHENTICATION
  ===================================== */

  const {
    user,
    token,
    logout,
  } = useAuth();


  /* =====================================
     MAIN STATE
  ===================================== */

  const [
    activeSection,
    setActiveSection,
  ] = useState(
    "dashboard"
  );


  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(
    false
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    ""
  );


  /* =====================================
     DASHBOARD DATA
  ===================================== */

  const [
    dashboardData,
    setDashboardData,
  ] = useState(
    null
  );


  const [
    users,
    setUsers,
  ] = useState(
    []
  );


  const [
    reservations,
    setReservations,
  ] = useState(
    []
  );


  const [
    seats,
    setSeats,
  ] = useState(
    []
  );


  const [
    activity,
    setActivity,
  ] = useState(
    []
  );


  /* =====================================
     SEARCH / FILTER
  ===================================== */

  const [
    reservationSearch,
    setReservationSearch,
  ] = useState(
    ""
  );


  const [
    reservationStatusFilter,
    setReservationStatusFilter,
  ] = useState(
    "all"
  );


  const [
    userSearch,
    setUserSearch,
  ] = useState(
    ""
  );


  const [
    seatSearch,
    setSeatSearch,
  ] = useState(
    ""
  );


  /* =====================================
     PAGINATION
  ===================================== */

  const [
    reservationPage,
    setReservationPage,
  ] = useState(
    1
  );


  const [
    userPage,
    setUserPage,
  ] = useState(
    1
  );


  const [
    seatPage,
    setSeatPage,
  ] = useState(
    1
  );


  const ITEMS_PER_PAGE =
    10;


  /* =====================================
     MODALS
  ===================================== */

  const [
    showCancelModal,
    setShowCancelModal,
  ] = useState(
    false
  );


  const [
    selectedReservation,
    setSelectedReservation,
  ] = useState(
    null
  );


  const [
    showSeatModal,
    setShowSeatModal,
  ] = useState(
    false
  );


  const [
    selectedSeat,
    setSelectedSeat,
  ] = useState(
    null
  );


  const [
    showUserModal,
    setShowUserModal,
  ] = useState(
    false
  );


  const [
    showQrScanner,
    setShowQrScanner,
  ] = useState(
    false
  );


  const [
    selectedUser,
    setSelectedUser,
  ] = useState(
    null
  );


  /* =====================================
     FORM STATE
  ===================================== */

  const [
    seatForm,
    setSeatForm,
  ] = useState({
    seatNumber:
      "",
    floor:
      "",
    zone:
      "",
    status:
      "available",
    isActive:
      true,
  });


  /* =====================================
     DATE / TIME HELPERS
  ===================================== */

  const formatExactDateTime =
    useCallback(
      (value) => {

        if (!value) {
          return "—";
        }

        const date =
          new Date(
            value
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return "—";
        }

        return date.toLocaleString(
          undefined,
          {
            day:
              "2-digit",
            month:
              "short",
            year:
              "numeric",
            hour:
              "2-digit",
            minute:
              "2-digit",
            second:
              "2-digit",
            hour12:
              true,
          }
        );
      },
      []
    );


  const formatDate =
    useCallback(
      (value) => {

        if (!value) {
          return "—";
        }

        const date =
          new Date(
            value
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return "—";
        }

        return date.toLocaleDateString(
          undefined,
          {
            day:
              "2-digit",
            month:
              "short",
            year:
              "numeric",
          }
        );
      },
      []
    );


  const formatTime =
    useCallback(
      (value) => {

        if (!value) {
          return "—";
        }

        const date =
          new Date(
            value
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return "—";
        }

        return date.toLocaleTimeString(
          undefined,
          {
            hour:
              "2-digit",
            minute:
              "2-digit",
            hour12:
              true,
          }
        );
      },
      []
    );


  /* =====================================
     STATUS NORMALIZER
  ===================================== */

  const normalizeStatus =
    useCallback(
      (status) => {

        if (!status) {
          return "booked";
        }

        const normalized =
          String(
            status
          )
            .trim()
            .toLowerCase();

        if (
          normalized ===
            "confirmed" ||
          normalized ===
            "booking" ||
          normalized ===
            "booked"
        ) {
          return "booked";
        }

        if (
          normalized ===
            "checked in" ||
          normalized ===
            "checked-in" ||
          normalized ===
            "checkedin"
        ) {
          return "checked-in";
        }

        if (
          normalized ===
            "completed" ||
          normalized ===
            "complete"
        ) {
          return "completed";
        }

        if (
          normalized ===
            "cancelled" ||
          normalized ===
            "canceled"
        ) {
          return "cancelled";
        }

        if (
          normalized ===
          "expired"
        ) {
          return "expired";
        }

        return normalized;
      },
      []
    );


  /* =====================================
     EFFECTIVE STATUS

     IMPORTANT:

     The database status alone is not enough.

     Example:

     Reservation:
       05 Sept 2026
       11:00 AM - 01:00 PM

     Today:
       07 Sept 2026

     If MongoDB still contains:

       status = "booked"

     the Admin dashboard must NOT continue
     showing it as an active future booking.

     A reservation whose scheduled end time
     has already passed is displayed as
     COMPLETED unless it was explicitly
     cancelled or expired.

     This is an ADMIN DISPLAY classification.
     It does not fabricate checkedInAt or
     checkedOutAt.
  ===================================== */

  const getEffectiveStatus =
    useCallback(
      (reservation) => {

        if (!reservation) {
          return "booked";
        }

        const storedStatus =
          normalizeStatus(
            reservation.status
          );


        if (
          storedStatus ===
          "cancelled"
        ) {
          return "cancelled";
        }


        if (
          storedStatus ===
          "expired"
        ) {
          return "expired";
        }


        if (
          storedStatus ===
          "completed"
        ) {
          return "completed";
        }


        if (
          storedStatus ===
          "checked-in"
        ) {

          if (
            reservation.checkedOutAt
          ) {
            return "completed";
          }

          if (
            reservation.endTime
          ) {

            const end =
              new Date(
                reservation.endTime
              );

            if (
              !Number.isNaN(
                end.getTime()
              ) &&
              end.getTime() <=
                Date.now()
            ) {
              return "completed";
            }
          }

          return "checked-in";
        }


        if (
          reservation.endTime
        ) {

          const end =
            new Date(
              reservation.endTime
            );

          if (
            !Number.isNaN(
              end.getTime()
            ) &&
            end.getTime() <=
              Date.now()
          ) {
            return "completed";
          }
        }


        return "booked";
      },
      [
        normalizeStatus,
      ]
    );


  /* =====================================
     VALID ATTENDANCE TIMESTAMPS

     Attendance Audit must only display
     timestamps that are valid for the
     reservation's scheduled window.
  ===================================== */

  const getValidCheckInTime =
    useCallback(
      (reservation) => {

        if (
          !reservation?.checkedInAt ||
          !reservation?.startTime
        ) {
          return null;
        }

        const checkedInAt =
          new Date(
            reservation.checkedInAt
          );

        const startTime =
          new Date(
            reservation.startTime
          );

        const deadlineTime =
          new Date(
            reservation.checkInDeadline ||
            reservation.endTime
          );

        if (
          Number.isNaN(
            checkedInAt.getTime()
          ) ||
          Number.isNaN(
            startTime.getTime()
          ) ||
          Number.isNaN(
            deadlineTime.getTime()
          )
        ) {
          return null;
        }

        if (
          checkedInAt < startTime ||
          checkedInAt > deadlineTime
        ) {
          return null;
        }

        return checkedInAt;
      },
      []
    );


  const getValidCheckOutTime =
    useCallback(
      (reservation) => {

        /* =====================================
           AUTOMATIC CHECK-OUT DISPLAY RULE

           A checkout can never be later than
           the reservation's scheduled end time.

           Example:

           Booking:      2:00 PM - 4:00 PM
           Check-in:     2:25 PM
           No checkout:  4:00 PM (automatic)

           If an old/late manual timestamp such
           as 10:08 PM exists in MongoDB, the
           Attendance Audit must still show
           4:00 PM, not 10:08 PM.
        ===================================== */

        if (!reservation) {
          return null;
        }

        const checkedInAt =
          getValidCheckInTime(
            reservation
          );

        if (!checkedInAt) {
          return null;
        }

        const endTime =
          reservation?.endTime
            ? new Date(
                reservation.endTime
              )
            : null;

        if (
          !endTime ||
          Number.isNaN(
            endTime.getTime()
          )
        ) {
          return null;
        }

        /* =====================================
           REAL MANUAL CHECK-OUT

           If the student checked out before or
           exactly at the scheduled end time,
           preserve the real checkout timestamp.
        ===================================== */

        if (reservation?.checkedOutAt) {

          const checkedOutAt =
            new Date(
              reservation.checkedOutAt
            );

          if (
            !Number.isNaN(
              checkedOutAt.getTime()
            )
          ) {

            /* Checkout cannot occur before
               the valid check-in timestamp. */
            if (
              checkedOutAt <
              checkedInAt
            ) {
              return null;
            }

            /* =================================
               LATE CHECK-OUT PROTECTION

               Example:
               Scheduled end = 4:00 PM
               Stored checkout = 10:08 PM

               Treat it as an automatic checkout
               at 4:00 PM.
            ================================= */

            if (
              checkedOutAt >
              endTime
            ) {
              return endTime;
            }

            return checkedOutAt;
          }
        }

        /* =====================================
           NO MANUAL CHECK-OUT

           Once the scheduled end time has
           passed, the reservation is treated
           as automatically checked out exactly
           at its scheduled end time.
        ===================================== */

        if (
          endTime.getTime() <=
          Date.now()
        ) {
          return endTime;
        }

        return null;
      },
      [
        getValidCheckInTime,
      ]
    );


  const getAttendanceStatus =
    useCallback(
      (reservation) => {

        if (!reservation) {
          return "booked";
        }

        const storedStatus =
          normalizeStatus(
            reservation.status
          );

        if (
          storedStatus ===
          "cancelled"
        ) {
          return "cancelled";
        }

        if (
          storedStatus ===
          "expired"
        ) {
          return "expired";
        }

        const checkedInAt =
          getValidCheckInTime(
            reservation
          );

        const checkedOutAt =
          getValidCheckOutTime(
            reservation
          );

        if (
          checkedOutAt
        ) {
          return "completed";
        }

        if (
          checkedInAt
        ) {
          return "checked-in";
        }

        return "booked";
      },
      [
        normalizeStatus,
        getValidCheckInTime,
        getValidCheckOutTime,
      ]
    );


  const attendanceRecords =
    useMemo(
      () => {

        const filterValidRecords =
          (source) =>
            source.filter(
              (reservation) => {

                const hasUser =
                  Boolean(
                    reservation?.user ||
                    reservation?.student
                  );

                const hasValidCheckIn =
                  Boolean(
                    getValidCheckInTime(
                      reservation
                    )
                  );

                const hasValidCheckOut =
                  Boolean(
                    getValidCheckOutTime(
                      reservation
                    )
                  );

                return (
                  hasUser &&
                  (hasValidCheckIn ||
                    hasValidCheckOut)
                );
              }
            );

        if (activity.length) {

          const activityRecords =
            filterValidRecords(
              activity
            );

          if (activityRecords.length) {
            return activityRecords;
          }
        }

        return filterValidRecords(
          reservations
        );
      },
      [
        activity,
        reservations,
        getValidCheckInTime,
        getValidCheckOutTime,
      ]
    );


  const attendanceCheckIns =
    useMemo(
      () =>
        attendanceRecords.filter(
          (reservation) =>
            Boolean(
              getValidCheckInTime(
                reservation
              )
            )
        ).length,
      [
        attendanceRecords,
        getValidCheckInTime,
      ]
    );


  const attendanceCheckOuts =
    useMemo(
      () =>
        attendanceRecords.filter(
          (reservation) =>
            Boolean(
              getValidCheckOutTime(
                reservation
              )
            )
        ).length,
      [
        attendanceRecords,
        getValidCheckOutTime,
      ]
    );


  /* =====================================
     DISPLAY USER
  ===================================== */

  const getReservationUser =
    useCallback(
      (reservation) => {

        return (
          reservation?.user ||
          reservation?.student ||
          null
        );
      },
      []
    );


  const getUserName =
    useCallback(
      (reservation) => {

        const reservationUser =
          getReservationUser(
            reservation
          );

        return (
          reservationUser?.name ||
          reservationUser?.fullName ||
          reservationUser?.email ||
          "Unknown User"
        );
      },
      [
        getReservationUser,
      ]
    );


  const getUserEmail =
    useCallback(
      (reservation) => {

        const reservationUser =
          getReservationUser(
            reservation
          );

        return (
          reservationUser?.email ||
          "—"
        );
      },
      [
        getReservationUser,
      ]
    );


  /* =====================================
     DISPLAY SEAT
  ===================================== */

  const getSeatNumber =
    useCallback(
      (reservation) => {

        return (
          reservation?.seatNumber ||
          reservation?.seat?.seatNumber ||
          reservation?.seat?.number ||
          reservation?.seat?.name ||
          "—"
        );
      },
      []
    );


  /* =====================================
     DISPLAY FLOOR
  ===================================== */

  const getFloor =
    useCallback(
      (reservation) => {

        return (
          reservation?.floor ||
          reservation?.seat?.floor ||
          "—"
        );
      },
      []
    );


  /* =====================================
     LOAD DASHBOARD
  ===================================== */

  const loadDashboard =
    useCallback(
      async (
        showSpinner = true
      ) => {

        if (!token) {
          setLoading(
            false
          );
          return;
        }


        try {

          if (
            showSpinner
          ) {
            setLoading(
              true
            );
          }
          else {
            setRefreshing(
              true
            );
          }


          setError(
            ""
          );


          const [
            dashboardResponse,
            usersResponse,
            reservationsResponse,
            seatsResponse,
            activityResponse,
          ] =
            await Promise.all([
              api.getAdminDashboard(
                token
              ),

              api.getAdminUsers(
                token
              ),

              api.getAdminReservations(
                token
              ),

              api.getAdminSeats(
                token
              ),

              api.getAdminActivity
                ? api.getAdminActivity(
                    token
                  )
                : Promise.resolve(
                    {
                      activity:
                        [],
                    }
                  ),
            ]);


          const dashboard =
            dashboardResponse
              ?.dashboard ||
            dashboardResponse ||
            null;


          const dashboardStatistics =
            dashboardResponse
              ?.statistics ||
            dashboard?.statistics ||
            dashboard ||
            null;


          setDashboardData(
            {
              ...(dashboard || {}),
              statistics:
                dashboardStatistics,
            }
          );


          const fetchedUsers =
            usersResponse
              ?.users ||
            [];


          setUsers(
            Array.isArray(
              fetchedUsers
            )
              ? fetchedUsers
              : []
          );


          const fetchedReservations =
            reservationsResponse
              ?.reservations ||
            [];


          setReservations(
            Array.isArray(
              fetchedReservations
            )
              ? fetchedReservations
              : []
          );


          const fetchedSeats =
            seatsResponse
              ?.seats ||
            [];


          setSeats(
            Array.isArray(
              fetchedSeats
            )
              ? fetchedSeats
              : []
          );


          const fetchedActivity =
            activityResponse
              ?.activity ||
            [];


          setActivity(
            Array.isArray(
              fetchedActivity
            )
              ? fetchedActivity
              : []
          );

        }
        catch (
          requestError
        ) {

          console.error(
            "Admin dashboard loading error:",
            requestError
          );


          setError(
            requestError?.message ||
              "Unable to load admin dashboard data."
          );

        }
        finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }

      },
      [
        token,
      ]
    );


  /* =====================================
     QR CHECK-IN SUCCESS
  ===================================== */

  const handleQrCheckInSuccess =
    async (reservation) => {

      setShowQrScanner(
        false
      );

      setSuccessMessage(
        reservation
          ? `Check-in successful for ${
              reservation?.user?.name ||
              "student"
            }.`
          : "Check-in successful."
      );

      await loadDashboard(
        false
      );

    };


  /* =====================================
     INITIAL LOAD
  ===================================== */

  useEffect(
    () => {

      loadDashboard(
        true
      );

    },
    [
      loadDashboard,
    ]
  );


  /* =====================================
     AUTO CLEAR SUCCESS MESSAGE
  ===================================== */

  useEffect(
    () => {

      if (!successMessage) {
        return undefined;
      }

      const timer =
        window.setTimeout(
          () => {
            setSuccessMessage(
              ""
            );
          },
          3500
        );

      return () =>
        window.clearTimeout(
          timer
        );

    },
    [
      successMessage,
    ]
  );


  /* =====================================
     FILTERED RESERVATIONS
  ===================================== */

  const filteredReservations =
    useMemo(
      () => {

        const query =
          reservationSearch
            .trim()
            .toLowerCase();


        return reservations.filter(
          (reservation) => {

            const status =
              getEffectiveStatus(
                reservation
              );


            if (
              reservationStatusFilter !==
                "all" &&
              status !==
                reservationStatusFilter
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            const userName =
              getUserName(
                reservation
              )
                .toLowerCase();


            const userEmail =
              getUserEmail(
                reservation
              )
                .toLowerCase();


            const seatNumber =
              String(
                getSeatNumber(
                  reservation
                )
              )
                .toLowerCase();


            return (
              userName.includes(
                query
              ) ||
              userEmail.includes(
                query
              ) ||
              seatNumber.includes(
                query
              )
            );
          }
        );

      },
      [
        reservations,
        reservationSearch,
        reservationStatusFilter,
        getEffectiveStatus,
        getUserName,
        getUserEmail,
        getSeatNumber,
      ]
    );


  /* =====================================
     PAGINATED RESERVATIONS
  ===================================== */

  const totalReservationPages =
    Math.max(
      1,
      Math.ceil(
        filteredReservations.length /
          ITEMS_PER_PAGE
      )
    );


  const paginatedReservations =
    useMemo(
      () => {

        const start =
          (
            reservationPage -
            1
          ) *
          ITEMS_PER_PAGE;


        return filteredReservations.slice(
          start,
          start +
            ITEMS_PER_PAGE
        );

      },
      [
        filteredReservations,
        reservationPage,
      ]
    );


  /* =====================================
     FILTERED USERS
  ===================================== */

  const filteredUsers =
    useMemo(
      () => {

        const query =
          userSearch
            .trim()
            .toLowerCase();


        if (!query) {
          return users;
        }


        return users.filter(
          (item) => {

            return (
              String(
                item?.name ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              String(
                item?.email ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              String(
                item?.studentId ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                )
            );
          }
        );

      },
      [
        users,
        userSearch,
      ]
    );


  const totalUserPages =
    Math.max(
      1,
      Math.ceil(
        filteredUsers.length /
          ITEMS_PER_PAGE
      )
    );


  const paginatedUsers =
    useMemo(
      () => {

        const start =
          (
            userPage -
            1
          ) *
          ITEMS_PER_PAGE;


        return filteredUsers.slice(
          start,
          start +
            ITEMS_PER_PAGE
        );

      },
      [
        filteredUsers,
        userPage,
      ]
    );


  /* =====================================
     FILTERED SEATS
  ===================================== */

  const filteredSeats =
    useMemo(
      () => {

        const query =
          seatSearch
            .trim()
            .toLowerCase();


        if (!query) {
          return seats;
        }


        return seats.filter(
          (seat) => {

            return (
              String(
                seat?.seatNumber ||
                  seat?.number ||
                  seat?.name ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              String(
                seat?.floor ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              String(
                seat?.zone ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                )
            );
          }
        );

      },
      [
        seats,
        seatSearch,
      ]
    );


  const totalSeatPages =
    Math.max(
      1,
      Math.ceil(
        filteredSeats.length /
          ITEMS_PER_PAGE
      )
    );


  const paginatedSeats =
    useMemo(
      () => {

        const start =
          (
            seatPage -
            1
          ) *
          ITEMS_PER_PAGE;


        return filteredSeats.slice(
          start,
          start +
            ITEMS_PER_PAGE
        );

      },
      [
        filteredSeats,
        seatPage,
      ]
    );


  /* =====================================
     RESET PAGINATION
  ===================================== */

  useEffect(
    () => {

      setReservationPage(
        1
      );

    },
    [
      reservationSearch,
      reservationStatusFilter,
    ]
  );


  useEffect(
    () => {

      setUserPage(
        1
      );

    },
    [
      userSearch,
    ]
  );


  useEffect(
    () => {

      setSeatPage(
        1
      );

    },
    [
      seatSearch,
    ]
  );


  /* =====================================
     STATISTICS
  ===================================== */

  const statistics =
    dashboardData?.statistics ||
    dashboardData ||
    {};


  const totalUsers =
    Number(
      statistics?.totalUsers ??
        statistics?.users?.total ??
        users.length
    );


  const totalSeats =
    Number(
      statistics?.totalSeats ??
        statistics?.seats?.total ??
        seats.length
    );


  const activeSeats =
    Number(
      statistics?.activeSeats ??
        statistics?.seats?.active ??
        seats.filter(
          (seat) =>
            seat?.isActive !==
            false
        ).length
    );


  const totalReservations =
    Number(
      statistics?.totalReservations ??
        statistics?.reservations?.total ??
        reservations.length
    );


  const bookedReservations =
    Number(
      statistics?.bookedReservations ??
        statistics?.reservations?.booked ??
        reservations.filter(
          (reservation) =>
            getEffectiveStatus(
              reservation
            ) ===
            "booked"
        ).length
    );


  const checkedInReservations =
    Number(
      statistics?.checkedInReservations ??
        statistics?.reservations?.checkedIn ??
        reservations.filter(
          (reservation) =>
            getEffectiveStatus(
              reservation
            ) ===
            "checked-in"
        ).length
    );


  const activeReservations =
    bookedReservations +
    checkedInReservations;


  const completedReservations =
    Number(
      statistics?.completedReservations ??
        statistics?.reservations?.completed ??
        reservations.filter(
          (reservation) =>
            getEffectiveStatus(
              reservation
            ) ===
            "completed"
        ).length
    );


  const cancelledReservations =
    Number(
      statistics?.cancelledReservations ??
        statistics?.reservations?.cancelled ??
        reservations.filter(
          (reservation) =>
            getEffectiveStatus(
              reservation
            ) ===
            "cancelled"
        ).length
    );


  const expiredReservations =
    Number(
      statistics?.expiredReservations ??
        statistics?.reservations?.expired ??
        reservations.filter(
          (reservation) =>
            getEffectiveStatus(
              reservation
            ) ===
            "expired"
        ).length
    );


  const totalCheckIns =
    Number(
      statistics?.totalCheckIns ??
        reservations.filter(
          (reservation) =>
            Boolean(
              getValidCheckInTime(
                reservation
              )
            )
        ).length
    );


  const totalCheckOuts =
    Number(
      statistics?.totalCheckOuts ??
        reservations.filter(
          (reservation) =>
            Boolean(
              getValidCheckOutTime(
                reservation
              )
            )
        ).length
    );


  const todayReservations =
    Number(
      statistics?.todayReservations ??
        0
    );


  const todayCheckIns =
    Number(
      statistics?.todayCheckIns ??
        0
    );


  const todayCheckOuts =
    Number(
      statistics?.todayCheckOuts ??
        0
    );


  const activeUsers =
    Number(
      statistics?.activeUsers ??
        statistics?.users?.active ??
        users.filter(
          (item) =>
            item?.isActive !==
              false &&
            item?.active !==
              false
        ).length
    );


  const inactiveUsers =
    Math.max(
      0,
      totalUsers -
        activeUsers
    );


  const administrators =
    Number(
      statistics?.totalAdmins ??
        statistics?.users?.admins ??
        users.filter(
          (item) =>
            item?.role ===
            "admin"
        ).length
    );


  /* =====================================
     OPEN ADMIN CANCELLATION MODAL
  ===================================== */

  const openCancelModal =
    (reservation) => {

      setSelectedReservation(
        reservation
      );

      setShowCancelModal(
        true
      );
    };


  /* =====================================
     CLOSE ADMIN CANCELLATION MODAL
  ===================================== */

  const closeCancelModal =
    () => {

      setSelectedReservation(
        null
      );

      setShowCancelModal(
        false
      );
    };


  /* =====================================
     ADMIN CANCEL RESERVATION
  ===================================== */

  const handleAdminCancelReservation =
    async () => {

      if (
        !selectedReservation ||
        !token
      ) {
        return;
      }


      const reservationId =
        selectedReservation?._id ||
        selectedReservation?.id;


      if (!reservationId) {

        setError(
          "Reservation ID is missing."
        );

        return;
      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await api.adminCancelReservation(
            token,
            reservationId
          );


        const updatedReservation =
          response?.reservation ||
          null;


        setReservations(
          (previous) =>
            previous.map(
              (
                reservation
              ) => {

                const currentId =
                  reservation?._id ||
                  reservation?.id;


                if (
                  String(
                    currentId
                  ) !==
                  String(
                    reservationId
                  )
                ) {
                  return reservation;
                }


                return {
                  ...reservation,
                  ...(updatedReservation ||
                    {}),
                  status:
                    "cancelled",
                  cancellationReason:
                    updatedReservation?.cancellationReason ||
                    "Cancelled by admin",
                  cancelledAt:
                    updatedReservation?.cancelledAt ||
                    new Date().toISOString(),
                };
              }
            )
        );


        setSuccessMessage(
          "Reservation cancelled successfully."
        );


        closeCancelModal();


        await loadDashboard(
          false
        );

      }
      catch (
        cancelError
      ) {

        console.error(
          "Admin reservation cancellation error:",
          cancelError
        );


        setError(
          cancelError?.message ||
            "Unable to cancel reservation."
        );

      }
      finally {

        setLoading(
          false
        );
      }
    };


  /* =====================================
     OPEN SEAT MODAL
  ===================================== */

  const openSeatModal =
    (seat = null) => {

      setSelectedSeat(
        seat
      );


      if (seat) {

        setSeatForm({
          seatNumber:
            seat?.seatNumber ||
            seat?.number ||
            seat?.name ||
            "",
          floor:
            seat?.floor ||
            "",
          zone:
            seat?.zone ||
            "",
          status:
            seat?.status ||
            "available",
          isActive:
            seat?.isActive !==
            false,
        });

      }
      else {

        setSeatForm({
          seatNumber:
            "",
          floor:
            "",
          zone:
            "",
          status:
            "available",
          isActive:
            true,
        });

      }


      setShowSeatModal(
        true
      );
    };


  /* =====================================
     CLOSE SEAT MODAL
  ===================================== */

  const closeSeatModal =
    () => {

      setSelectedSeat(
        null
      );

      setShowSeatModal(
        false
      );

      setSeatForm({
        seatNumber:
          "",
        floor:
          "",
        zone:
          "",
        status:
          "available",
        isActive:
          true,
      });
    };


  /* =====================================
     SAVE SEAT
  ===================================== */

  const handleSaveSeat =
    async (
      event
    ) => {

      event.preventDefault();


      if (!token) {
        return;
      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        if (
          selectedSeat
        ) {

          const seatId =
            selectedSeat?._id ||
            selectedSeat?.id;


          await api.updateAdminSeat(
            token,
            seatId,
            seatForm
          );


          setSuccessMessage(
            "Seat updated successfully."
          );

        }
        else {

          await api.createAdminSeat(
            token,
            seatForm
          );


          setSuccessMessage(
            "Seat created successfully."
          );
        }


        closeSeatModal();


        await loadDashboard(
          false
        );

      }
      catch (
        seatError
      ) {

        console.error(
          "Seat save error:",
          seatError
        );


        setError(
          seatError?.message ||
            "Unable to save seat."
        );

      }
      finally {

        setLoading(
          false
        );
      }
    };


  /* =====================================
     DELETE SEAT
  ===================================== */

  const handleDeleteSeat =
    async (
      seat
    ) => {

      if (!token) {
        return;
      }


      const seatId =
        seat?._id ||
        seat?.id;


      if (!seatId) {
        return;
      }


      const confirmed =
        window.confirm(
          `Are you sure you want to delete seat ${
            seat?.seatNumber ||
            seat?.number ||
            seat?.name ||
            ""
          }?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        await api.deleteAdminSeat(
          token,
          seatId
        );


        setSuccessMessage(
          "Seat deleted successfully."
        );


        await loadDashboard(
          false
        );

      }
      catch (
        deleteError
      ) {

        console.error(
          "Seat deletion error:",
          deleteError
        );


        setError(
          deleteError?.message ||
            "Unable to delete seat."
        );

      }
      finally {

        setLoading(
          false
        );
      }
    };


  /* =====================================
     USER STATUS
  ===================================== */

  const handleToggleUserStatus =
    async (
      item
    ) => {

      if (!token) {
        return;
      }


      const userId =
        item?._id ||
        item?.id;


      if (!userId) {
        return;
      }


      const currentlyActive =
        item?.isActive !==
          false &&
        item?.active !==
          false;


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await api.updateAdminUserStatus(
            token,
            userId,
            {
              isActive:
                !currentlyActive,
            }
          );


        const updatedUser =
          response?.user ||
          null;


        setUsers(
          (previous) =>
            previous.map(
              (
                currentUser
              ) => {

                const currentId =
                  currentUser?._id ||
                  currentUser?.id;


                if (
                  String(
                    currentId
                  ) !==
                  String(
                    userId
                  )
                ) {
                  return currentUser;
                }


                return {
                  ...currentUser,
                  ...(updatedUser ||
                    {}),
                  isActive:
                    updatedUser?.isActive ??
                    !currentlyActive,
                };
              }
            )
        );


        setSuccessMessage(
          `User ${
            currentlyActive
              ? "deactivated"
              : "activated"
          } successfully.`
        );

      }
      catch (
        userError
      ) {

        console.error(
          "User status update error:",
          userError
        );


        setError(
          userError?.message ||
            "Unable to update user status."
        );

      }
      finally {

        setLoading(
          false
        );
      }
    };


  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout =
    () => {

      logout();


      if (
        typeof goHome ===
        "function"
      ) {
        goHome();
      }
      else if (
        typeof onBack ===
        "function"
      ) {
        onBack();
      }
    };


  /* =====================================
     NAVIGATION ITEMS
  ===================================== */

  const navigationItems =
    [
      {
        id:
          "dashboard",
        label:
          "Dashboard",
        icon:
          LayoutDashboard,
      },
      {
        id:
          "reservations",
        label:
          "Reservations",
        icon:
          CalendarDays,
      },
      {
        id:
          "users",
        label:
          "Users",
        icon:
          Users,
      },
      {
        id:
          "seats",
        label:
          "Seats",
        icon:
          DoorOpen,
      },
      {
        id:
          "activity",
        label:
          "Check-In / Check-Out",
        icon:
          Clock3,
      },
    ];


  /* =====================================
     SIDEBAR NAVIGATION
  ===================================== */

  const navigateSection =
    (section) => {

      setActiveSection(
        section
      );

      setSidebarOpen(
        false
      );
    };


  /* =====================================
     LOADING SCREEN
  ===================================== */

  if (
    loading &&
    !dashboardData &&
    !users.length &&
    !reservations.length &&
    !seats.length
  ) {

    return (
      <div className="admin-loading-screen">

        <div className="admin-loading-card">

          <div className="admin-loading-spinner">
            <RefreshCw
              size={24}
            />
          </div>

          <h2>
            Loading Admin Dashboard
          </h2>

          <p>
            Fetching users, reservations,
            seats and activity data...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================
     RENDER
  ===================================== */

  return (

    <div className="admin-dashboard-page">

      {/* ===================================
          MOBILE OVERLAY
      =================================== */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        />
      )}


      {/* ===================================
          SIDEBAR
      =================================== */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-sidebar-brand">

          <div className="admin-brand-mark">
            <ShieldCheck
              size={24}
            />
          </div>

          <div className="admin-brand-text">

            <strong>
              BookMySeat
            </strong>

            <span>
              ADMIN CONSOLE
            </span>

          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
          >
            <X
              size={20}
            />
          </button>

        </div>


        <div className="admin-sidebar-user">

          <div className="admin-sidebar-avatar">
            {(
              user?.name ||
              "A"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="admin-sidebar-user-info">

            <strong>
              {user?.name ||
                "Administrator"}
            </strong>

            <span>
              {user?.email ||
                "Admin Account"}
            </span>

          </div>

        </div>


        <nav className="admin-sidebar-nav">

          <div className="admin-sidebar-section-label">
            MANAGEMENT
          </div>

          {navigationItems.map(
            (
              item
            ) => {

              const Icon =
                item.icon;


              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  className={`admin-sidebar-nav-item ${
                    activeSection ===
                    item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    navigateSection(
                      item.id
                    )
                  }
                >

                  <Icon
                    size={19}
                  />

                  <span>
                    {item.label}
                  </span>

                </button>
              );

            }
          )}

        </nav>


        <div className="admin-sidebar-bottom">

          <button
            type="button"
            className="admin-sidebar-nav-item"
            onClick={() =>
              navigateSection(
                "settings"
              )
            }
          >

            <Settings
              size={19}
            />

            <span>
              Settings
            </span>

          </button>


          <button
            type="button"
            className="admin-sidebar-nav-item admin-logout-button"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={19}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ===================================
          MAIN AREA
      =================================== */}

      <main className="admin-main">

        {/* =================================
            TOP BAR
        ================================= */}

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
            >
              <Menu
                size={21}
              />
            </button>


            <button
              type="button"
              className="admin-back-button"
              onClick={() => {

                if (
                  typeof onBack ===
                  "function"
                ) {
                  onBack();
                }
                else if (
                  typeof goHome ===
                  "function"
                ) {
                  goHome();
                }

              }}
            >

              <ArrowLeft
                size={18}
              />

              <span>
                Back
              </span>

            </button>


            <div className="admin-page-heading">

              <span>
                Administration
              </span>

              <h1>
                {activeSection ===
                  "dashboard" &&
                  "Dashboard"}

                {activeSection ===
                  "reservations" &&
                  "Reservation Management"}

                {activeSection ===
                  "users" &&
                  "User Management"}

                {activeSection ===
                  "seats" &&
                  "Seat Management"}

                {activeSection ===
                  "activity" &&
                  "Check-In / Check-Out Activity"}

                {activeSection ===
                  "settings" &&
                  "Settings"}
              </h1>

            </div>

          </div>


          <div className="admin-topbar-actions">

            <button
              type="button"
              className={`admin-refresh-button ${
                refreshing
                  ? "refreshing"
                  : ""
              }`}
              onClick={() =>
                loadDashboard(
                  false
                )
              }
              disabled={
                refreshing
              }
              title="Refresh data"
            >

              <RefreshCw
                size={18}
              />

              <span>
                Refresh
              </span>

            </button>


            <div className="admin-topbar-profile">

              <div className="admin-topbar-avatar">
                {(
                  user?.name ||
                  "A"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {user?.name ||
                    "Administrator"}
                </strong>

                <span>
                  Administrator
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* =================================
            ALERTS
        ================================= */}

        {error && (
          <div className="admin-alert admin-alert-error">

            <AlertCircle
              size={19}
            />

            <div>
              <strong>
                Something went wrong
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError(
                  ""
                )
              }
            >
              <X
                size={17}
              />
            </button>

          </div>
        )}


        {successMessage && (
          <div className="admin-alert admin-alert-success">

            <CheckCircle2
              size={19}
            />

            <div>
              <strong>
                Success
              </strong>

              <span>
                {successMessage}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  ""
                )
              }
            >
              <X
                size={17}
              />
            </button>

          </div>
        )}


        {/* =================================
            CONTENT
        ================================= */}

        <div className="admin-content">


          {/* =================================
              DASHBOARD SECTION
          ================================= */}

          {activeSection ===
            "dashboard" && (

            <section className="admin-section">

              <div className="admin-section-intro">

                <div>

                  <span className="admin-eyebrow">
                    SYSTEM OVERVIEW
                  </span>

                  <h2>
                    Library Operations
                  </h2>

                  <p>
                    Monitor reservations,
                    users, seat utilization
                    and real-time attendance
                    activity.
                  </p>

                </div>

                <div className="admin-live-indicator">

                  <span className="admin-live-dot" />

                  Live Data

                </div>

              </div>


              {/* ===========================
                  PRIMARY STATISTICS
              =========================== */}

              <div className="admin-stat-grid">

                <div className="admin-stat-card">

                  <div className="admin-stat-icon purple">
                    <Users
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Total Users
                    </span>

                    <strong>
                      {totalUsers}
                    </strong>

                    <small>
                      {activeUsers}
                      {" "}
                      active users
                    </small>

                  </div>

                </div>


                <div className="admin-stat-card">

                  <div className="admin-stat-icon blue">
                    <CalendarDays
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Total Reservations
                    </span>

                    <strong>
                      {totalReservations}
                    </strong>

                    <small>
                      {activeReservations}
                      {" "}
                      active
                    </small>

                  </div>

                </div>


                <div className="admin-stat-card">

                  <div className="admin-stat-icon green">
                    <CheckCircle2
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Completed
                    </span>

                    <strong>
                      {completedReservations}
                    </strong>

                    <small>
                      Finished reservations
                    </small>

                  </div>

                </div>


                <div className="admin-stat-card">

                  <div className="admin-stat-icon orange">
                    <DoorOpen
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Available Seats
                    </span>

                    <strong>
                      {Math.max(
                        0,
                        totalSeats -
                          (
                            totalSeats -
                            activeSeats
                          )
                      )}
                    </strong>

                    <small>
                      {activeSeats}
                      {" "}
                      active seats
                    </small>

                  </div>

                </div>

              </div>


              {/* ===========================
                  ATTENDANCE STATISTICS
              =========================== */}

              <div className="admin-stat-grid admin-stat-grid-secondary">

                <div className="admin-stat-card admin-attendance-card">

                  <div className="admin-stat-icon teal">
                    <UserCheck
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Total Check-Ins
                    </span>

                    <strong>
                      {totalCheckIns}
                    </strong>

                    <small>
                      {todayCheckIns}
                      {" "}
                      today
                    </small>

                  </div>

                </div>


                <div className="admin-stat-card admin-attendance-card">

                  <div className="admin-stat-icon violet">
                    <LogOut
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Total Check-Outs
                    </span>

                    <strong>
                      {totalCheckOuts}
                    </strong>

                    <small>
                      {todayCheckOuts}
                      {" "}
                      today
                    </small>

                  </div>

                </div>


                <div className="admin-stat-card admin-attendance-card">

                  <div className="admin-stat-icon cyan">
                    <Clock3
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Today's Reservations
                    </span>

                    <strong>
                      {todayReservations}
                    </strong>

                    <small>
                      Scheduled for today
                    </small>

                  </div>

                </div>


                <div className="admin-stat-card admin-attendance-card">

                  <div className="admin-stat-icon red">
                    <Ban
                      size={21}
                    />
                  </div>

                  <div className="admin-stat-content">

                    <span>
                      Cancelled
                    </span>

                    <strong>
                      {cancelledReservations}
                    </strong>

                    <small>
                      {expiredReservations}
                      {" "}
                      expired
                    </small>

                  </div>

                </div>

              </div>


              {/* ===========================
                  SUMMARY CARDS
              =========================== */}

              <div className="admin-summary-grid">

                <div className="admin-panel admin-summary-panel">

                  <div className="admin-panel-heading">

                    <div>

                      <h3>
                        Reservation Summary
                      </h3>

                      <p>
                        Current reservation activity
                      </p>

                    </div>

                  </div>


                  <div className="admin-summary-list">

                    <div className="admin-summary-row">

                      <span>
                        Booked
                      </span>

                      <strong>
                        {bookedReservations}
                      </strong>

                    </div>


                    <div className="admin-summary-row">

                      <span>
                        Checked In
                      </span>

                      <strong>
                        {checkedInReservations}
                      </strong>

                    </div>


                    <div className="admin-summary-row">

                      <span>
                        Completed
                      </span>

                      <strong>
                        {completedReservations}
                      </strong>

                    </div>


                    <div className="admin-summary-row">

                      <span>
                        Cancelled
                      </span>

                      <strong>
                        {cancelledReservations}
                      </strong>

                    </div>

                  </div>

                </div>


                <div className="admin-panel admin-summary-panel">

                  <div className="admin-panel-heading">

                    <div>

                      <h3>
                        User Summary
                      </h3>

                      <p>
                        Current user account status
                      </p>

                    </div>

                  </div>


                  <div className="admin-summary-list">

                    <div className="admin-summary-row">

                      <span>
                        Active Users
                      </span>

                      <strong>
                        {activeUsers}
                      </strong>

                    </div>


                    <div className="admin-summary-row">

                      <span>
                        Inactive Users
                      </span>

                      <strong>
                        {inactiveUsers}
                      </strong>

                    </div>


                    <div className="admin-summary-row">

                      <span>
                        Administrators
                      </span>

                      <strong>
                        {administrators}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>


              {/* ===========================
                  RECENT RESERVATIONS
              =========================== */}

              <div className="admin-panel admin-recent-panel">

                <div className="admin-panel-heading">

                  <div>

                    <h3>
                      Recent Reservations
                    </h3>

                    <p>
                      Latest booking activity
                      in the system
                    </p>

                  </div>


                  <button
                    type="button"
                    className="admin-panel-action"
                    onClick={() =>
                      navigateSection(
                        "reservations"
                      )
                    }
                  >
                    View All
                    <ArrowLeft
                      size={15}
                      className="rotate-180"
                    />
                  </button>

                </div>


                <div className="admin-table-wrapper">

                  <table className="admin-table admin-recent-table">

                    <thead>

                      <tr>

                        <th>
                          USER
                        </th>

                        <th>
                          SEAT
                        </th>

                        <th>
                          START TIME
                        </th>

                        <th>
                          CHECK IN
                        </th>

                        <th>
                          CHECK OUT
                        </th>

                        <th>
                          STATUS
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {reservations
                        .slice(
                          0,
                          5
                        )
                        .map(
                          (
                            reservation
                          ) => {

                            const status =
                              getEffectiveStatus(
                                reservation
                              );


                            return (
                              <tr
                                key={
                                  reservation?._id ||
                                  reservation?.id
                                }
                              >

                                <td>

                                  <div className="admin-user-cell">

                                    <strong>
                                      {getUserName(
                                        reservation
                                      )}
                                    </strong>

                                    <span>
                                      {getUserEmail(
                                        reservation
                                      )}
                                    </span>

                                  </div>

                                </td>


                                <td>

                                  <strong>
                                    {getSeatNumber(
                                      reservation
                                    )}
                                  </strong>

                                </td>


                                <td>

                                  {formatExactDateTime(
                                    reservation?.startTime
                                  )}

                                </td>


                                <td>

                                  <span
                                    className={
                                      getValidCheckInTime(
                                        reservation
                                      )
                                        ? "admin-time-value"
                                        : "admin-time-empty"
                                    }
                                  >
                                    {formatExactDateTime(
                                      getValidCheckInTime(
                                        reservation
                                      )
                                    )}
                                  </span>

                                </td>


                                <td>

                                  <span
                                    className={
                                      getValidCheckOutTime(
                                        reservation
                                      )
                                        ? "admin-time-value"
                                        : "admin-time-empty"
                                    }
                                  >
                                    {formatExactDateTime(
                                      getValidCheckOutTime(
                                        reservation
                                      )
                                    )}
                                  </span>

                                </td>


                                <td>

                                  <span
                                    className={`admin-status-badge ${status}`}
                                  >

                                    <span />

                                    {status ===
                                      "checked-in" &&
                                      "Checked In"}

                                    {status ===
                                      "booked" &&
                                      "Booked"}

                                    {status ===
                                      "completed" &&
                                      "Completed"}

                                    {status ===
                                      "cancelled" &&
                                      "Cancelled"}

                                    {status ===
                                      "expired" &&
                                      "Expired"}

                                  </span>

                                </td>

                              </tr>
                            );

                          }
                        )}


                      {!reservations.length && (
                        <tr>

                          <td
                            colSpan={
                              6
                            }
                            className="admin-empty-cell"
                          >
                            No reservations found.
                          </td>

                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>
          )}


          {/* =================================
              RESERVATIONS SECTION
          ================================= */}

          {activeSection ===
            "reservations" && (

            <section className="admin-section">

              <div className="admin-section-intro">

                <div>

                  <span className="admin-eyebrow">
                    RESERVATION MANAGEMENT
                  </span>

                  <h2>
                    All Reservations
                  </h2>

                  <p>
                    Review every reservation,
                    actual attendance timestamps
                    and manage cancellations.
                  </p>

                </div>

                <div className="admin-section-count">
                  {filteredReservations.length}
                  {" "}
                  reservations
                </div>

              </div>


              {/* ===========================
                  FILTER BAR
              =========================== */}

              <div className="admin-filter-bar">

                <div className="admin-search-box">

                  <Search
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search user, email or seat..."
                    value={
                      reservationSearch
                    }
                    onChange={(event) =>
                      setReservationSearch(
                        event.target.value
                      )
                    }
                  />

                  {reservationSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setReservationSearch(
                          ""
                        )
                      }
                    >
                      <X
                        size={16}
                      />
                    </button>
                  )}

                </div>


                <div className="admin-filter-select">

                  <Filter
                    size={17}
                  />

                  <select
                    value={
                      reservationStatusFilter
                    }
                    onChange={(event) =>
                      setReservationStatusFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="all">
                      All Statuses
                    </option>

                    <option value="booked">
                      Booked
                    </option>

                    <option value="checked-in">
                      Checked In
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>

                    <option value="expired">
                      Expired
                    </option>

                  </select>

                  <ChevronDown
                    size={16}
                  />

                </div>

              </div>


              {/* ===========================
                  RESERVATION TABLE
              =========================== */}

              <div className="admin-panel">

                <div className="admin-table-wrapper">

                  <table className="admin-table admin-reservation-management-table">

                    <thead>

                      <tr>

                        <th>
                          USER
                        </th>

                        <th>
                          SEAT
                        </th>

                        <th>
                          START
                        </th>

                        <th>
                          END
                        </th>

                        <th>
                          ACTUAL CHECK-IN
                        </th>

                        <th>
                          ACTUAL CHECK-OUT
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTION
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {paginatedReservations.map(
                        (
                          reservation
                        ) => {

                          const status =
                            getEffectiveStatus(
                              reservation
                            );


                          const reservationId =
                            reservation?._id ||
                            reservation?.id;


                          const canCancel =
                            status ===
                              "booked" ||
                            status ===
                              "checked-in";


                          return (
                            <tr
                              key={
                                reservationId
                              }
                            >

                              <td>

                                <div className="admin-user-cell">

                                  <strong>
                                    {getUserName(
                                      reservation
                                    )}
                                  </strong>

                                  <span>
                                    {getUserEmail(
                                      reservation
                                    )}
                                  </span>

                                </div>

                              </td>


                              <td>

                                <div className="admin-seat-cell">

                                  <strong>
                                    {getSeatNumber(
                                      reservation
                                    )}
                                  </strong>

                                  <span>
                                    {getFloor(
                                      reservation
                                    )}
                                  </span>

                                </div>

                              </td>


                              <td>
                                {formatExactDateTime(
                                  reservation?.startTime
                                )}
                              </td>


                              <td>
                                {formatExactDateTime(
                                  reservation?.endTime
                                )}
                              </td>


                              <td>

                                <span
                                  className={
                                    getValidCheckInTime(
                                      reservation
                                    )
                                      ? "admin-exact-time"
                                      : "admin-time-empty"
                                  }
                                >

                                  {formatExactDateTime(
                                    getValidCheckInTime(
                                      reservation
                                    )
                                  )}

                                </span>

                              </td>


                              <td>

                                <span
                                  className={
                                    getValidCheckOutTime(
                                      reservation
                                    )
                                      ? "admin-exact-time"
                                      : "admin-time-empty"
                                  }
                                >

                                  {formatExactDateTime(
                                    getValidCheckOutTime(
                                      reservation
                                    )
                                  )}

                                </span>

                              </td>


                              <td>

                                <span
                                  className={`admin-status-badge ${status}`}
                                >

                                  <span />

                                  {status ===
                                    "booked" &&
                                    "Booked"}

                                  {status ===
                                    "checked-in" &&
                                    "Checked In"}

                                  {status ===
                                    "completed" &&
                                    "Completed"}

                                  {status ===
                                    "cancelled" &&
                                    "Cancelled"}

                                  {status ===
                                    "expired" &&
                                    "Expired"}

                                </span>

                              </td>


                              <td>

                                {canCancel ? (

                                  <button
                                    type="button"
                                    className="admin-danger-outline-button"
                                    onClick={() =>
                                      openCancelModal(
                                        reservation
                                      )
                                    }
                                  >

                                    <Ban
                                      size={15}
                                    />

                                    Cancel

                                  </button>

                                ) : (

                                  <span className="admin-no-action">
                                    —
                                  </span>

                                )}

                              </td>

                            </tr>
                          );

                        }
                      )}


                      {!paginatedReservations.length && (
                        <tr>

                          <td
                            colSpan={
                              8
                            }
                            className="admin-empty-cell"
                          >

                            No reservations match
                            your filters.

                          </td>

                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>


                {/* =========================
                    PAGINATION
                ========================= */}

                <div className="admin-pagination">

                  <span>

                    Showing{" "}
                    {filteredReservations.length
                      ? (
                          (
                            reservationPage -
                            1
                          ) *
                            ITEMS_PER_PAGE +
                          1
                        )
                      : 0}
                    {" "}
                    to{" "}
                    {Math.min(
                      reservationPage *
                        ITEMS_PER_PAGE,
                      filteredReservations.length
                    )}
                    {" "}
                    of{" "}
                    {filteredReservations.length}

                  </span>


                  <div className="admin-pagination-controls">

                    <button
                      type="button"
                      disabled={
                        reservationPage <=
                        1
                      }
                      onClick={() =>
                        setReservationPage(
                          (
                            page
                          ) =>
                            Math.max(
                              1,
                              page -
                                1
                            )
                        )
                      }
                    >

                      <ChevronLeft
                        size={17}
                      />

                    </button>


                    <span>
                      {reservationPage}
                      {" "}
                      /{" "}
                      {totalReservationPages}
                    </span>


                    <button
                      type="button"
                      disabled={
                        reservationPage >=
                        totalReservationPages
                      }
                      onClick={() =>
                        setReservationPage(
                          (
                            page
                          ) =>
                            Math.min(
                              totalReservationPages,
                              page +
                                1
                            )
                        )
                      }
                    >

                      <ChevronRight
                        size={17}
                      />

                    </button>

                  </div>

                </div>

              </div>

            </section>
          )}


          {/* =================================
              USERS SECTION
          ================================= */}

          {activeSection ===
            "users" && (

            <section className="admin-section">

              <div className="admin-section-intro">

                <div>

                  <span className="admin-eyebrow">
                    USER MANAGEMENT
                  </span>

                  <h2>
                    Registered Users
                  </h2>

                  <p>
                    Manage student and administrator
                    accounts.
                  </p>

                </div>

                <div className="admin-section-count">
                  {filteredUsers.length}
                  {" "}
                  users
                </div>

              </div>


              <div className="admin-filter-bar">

                <div className="admin-search-box">

                  <Search
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search name, email or student ID..."
                    value={
                      userSearch
                    }
                    onChange={(event) =>
                      setUserSearch(
                        event.target.value
                      )
                    }
                  />

                  {userSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setUserSearch(
                          ""
                        )
                      }
                    >
                      <X
                        size={16}
                      />
                    </button>
                  )}

                </div>

              </div>


              <div className="admin-panel">

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>

                      <tr>

                        <th>
                          USER
                        </th>

                        <th>
                          STUDENT ID
                        </th>

                        <th>
                          ROLE
                        </th>

                        <th>
                          CREATED
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTION
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {paginatedUsers.map(
                        (
                          item
                        ) => {

                          const isActive =
                            item?.isActive !==
                              false &&
                            item?.active !==
                              false;


                          return (
                            <tr
                              key={
                                item?._id ||
                                item?.id
                              }
                            >

                              <td>

                                <div className="admin-user-cell admin-user-cell-large">

                                  <div className="admin-table-avatar">

                                    {(
                                      item?.name ||
                                      item?.email ||
                                      "U"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>

                                  <div>

                                    <strong>
                                      {item?.name ||
                                        "Unknown User"}
                                    </strong>

                                    <span>
                                      {item?.email ||
                                        "—"}
                                    </span>

                                  </div>

                                </div>

                              </td>


                              <td>
                                {item?.studentId ||
                                  "—"}
                              </td>


                              <td>

                                <span
                                  className={`admin-role-badge ${
                                    item?.role ===
                                    "admin"
                                      ? "admin"
                                      : "student"
                                  }`}
                                >

                                  {item?.role ===
                                    "admin"
                                    ? "Administrator"
                                    : "Student"}

                                </span>

                              </td>


                              <td>
                                {formatDate(
                                  item?.createdAt
                                )}
                              </td>


                              <td>

                                <span
                                  className={`admin-status-badge ${
                                    isActive
                                      ? "active"
                                      : "inactive"
                                  }`}
                                >

                                  <span />

                                  {isActive
                                    ? "Active"
                                    : "Inactive"}

                                </span>

                              </td>


                              <td>

                                {item?._id !==
                                  user?._id &&
                                  item?.id !==
                                    user?.id ? (

                                  <button
                                    type="button"
                                    className={
                                      isActive
                                        ? "admin-danger-outline-button"
                                        : "admin-success-outline-button"
                                    }
                                    onClick={() =>
                                      handleToggleUserStatus(
                                        item
                                      )
                                    }
                                  >

                                    {isActive
                                      ? "Deactivate"
                                      : "Activate"}

                                  </button>

                                ) : (

                                  <span className="admin-current-user">
                                    Current Admin
                                  </span>

                                )}

                              </td>

                            </tr>
                          );

                        }
                      )}


                      {!paginatedUsers.length && (
                        <tr>

                          <td
                            colSpan={
                              6
                            }
                            className="admin-empty-cell"
                          >
                            No users found.
                          </td>

                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>


                <div className="admin-pagination">

                  <span>

                    Showing{" "}
                    {filteredUsers.length
                      ? (
                          (
                            userPage -
                            1
                          ) *
                            ITEMS_PER_PAGE +
                          1
                        )
                      : 0}
                    {" "}
                    to{" "}
                    {Math.min(
                      userPage *
                        ITEMS_PER_PAGE,
                      filteredUsers.length
                    )}
                    {" "}
                    of{" "}
                    {filteredUsers.length}

                  </span>


                  <div className="admin-pagination-controls">

                    <button
                      type="button"
                      disabled={
                        userPage <=
                        1
                      }
                      onClick={() =>
                        setUserPage(
                          (
                            page
                          ) =>
                            Math.max(
                              1,
                              page -
                                1
                            )
                        )
                      }
                    >

                      <ChevronLeft
                        size={17}
                      />

                    </button>


                    <span>
                      {userPage}
                      {" "}
                      /{" "}
                      {totalUserPages}
                    </span>


                    <button
                      type="button"
                      disabled={
                        userPage >=
                        totalUserPages
                      }
                      onClick={() =>
                        setUserPage(
                          (
                            page
                          ) =>
                            Math.min(
                              totalUserPages,
                              page +
                                1
                            )
                        )
                      }
                    >

                      <ChevronRight
                        size={17}
                      />

                    </button>

                  </div>

                </div>

              </div>

            </section>
          )}


          {/* =================================
              SEATS SECTION
          ================================= */}

          {activeSection ===
            "seats" && (

            <section className="admin-section">

              <div className="admin-section-intro">

                <div>

                  <span className="admin-eyebrow">
                    SEAT MANAGEMENT
                  </span>

                  <h2>
                    Library Seats
                  </h2>

                  <p>
                    Add, edit and remove seats
                    from the library.
                  </p>

                </div>


                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={() =>
                    openSeatModal()
                  }
                >

                  <Plus
                    size={18}
                  />

                  Add Seat

                </button>

              </div>


              <div className="admin-filter-bar">

                <div className="admin-search-box">

                  <Search
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search seat, floor or zone..."
                    value={
                      seatSearch
                    }
                    onChange={(event) =>
                      setSeatSearch(
                        event.target.value
                      )
                    }
                  />

                  {seatSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setSeatSearch(
                          ""
                        )
                      }
                    >
                      <X
                        size={16}
                      />
                    </button>
                  )}

                </div>

              </div>


              <div className="admin-panel">

                <div className="admin-table-wrapper">

                  <table className="admin-table">

                    <thead>

                      <tr>

                        <th>
                          SEAT
                        </th>

                        <th>
                          FLOOR
                        </th>

                        <th>
                          ZONE
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTIVE
                        </th>

                        <th>
                          ACTION
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {paginatedSeats.map(
                        (
                          seat
                        ) => {

                          const seatId =
                            seat?._id ||
                            seat?.id;


                          const seatNumber =
                            seat?.seatNumber ||
                            seat?.number ||
                            seat?.name ||
                            "—";


                          const isActive =
                            seat?.isActive !==
                            false;


                          return (
                            <tr
                              key={
                                seatId
                              }
                            >

                              <td>

                                <strong className="admin-seat-number">
                                  {seatNumber}
                                </strong>

                              </td>


                              <td>
                                {seat?.floor ||
                                  "—"}
                              </td>


                              <td>
                                {seat?.zone ||
                                  seat?.type ||
                                  "—"}
                              </td>


                              <td>

                                <span
                                  className={`admin-status-badge ${
                                    String(
                                      seat?.status ||
                                        "available"
                                    )
                                      .toLowerCase()
                                  }`}
                                >

                                  <span />

                                  {seat?.status ||
                                    "Available"}

                                </span>

                              </td>


                              <td>

                                <span
                                  className={`admin-status-badge ${
                                    isActive
                                      ? "active"
                                      : "inactive"
                                  }`}
                                >

                                  <span />

                                  {isActive
                                    ? "Active"
                                    : "Inactive"}

                                </span>

                              </td>


                              <td>

                                <div className="admin-action-group">

                                  <button
                                    type="button"
                                    className="admin-icon-button"
                                    title="Edit seat"
                                    onClick={() =>
                                      openSeatModal(
                                        seat
                                      )
                                    }
                                  >

                                    <Edit3
                                      size={16}
                                    />

                                  </button>


                                  <button
                                    type="button"
                                    className="admin-icon-button danger"
                                    title="Delete seat"
                                    onClick={() =>
                                      handleDeleteSeat(
                                        seat
                                      )
                                    }
                                  >

                                    <Trash2
                                      size={16}
                                    />

                                  </button>

                                </div>

                              </td>

                            </tr>
                          );

                        }
                      )}


                      {!paginatedSeats.length && (
                        <tr>

                          <td
                            colSpan={
                              6
                            }
                            className="admin-empty-cell"
                          >
                            No seats found.
                          </td>

                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>


                <div className="admin-pagination">

                  <span>

                    Showing{" "}
                    {filteredSeats.length
                      ? (
                          (
                            seatPage -
                            1
                          ) *
                            ITEMS_PER_PAGE +
                          1
                        )
                      : 0}
                    {" "}
                    to{" "}
                    {Math.min(
                      seatPage *
                        ITEMS_PER_PAGE,
                      filteredSeats.length
                    )}
                    {" "}
                    of{" "}
                    {filteredSeats.length}

                  </span>


                  <div className="admin-pagination-controls">

                    <button
                      type="button"
                      disabled={
                        seatPage <=
                        1
                      }
                      onClick={() =>
                        setSeatPage(
                          (
                            page
                          ) =>
                            Math.max(
                              1,
                              page -
                                1
                            )
                        )
                      }
                    >

                      <ChevronLeft
                        size={17}
                      />

                    </button>


                    <span>
                      {seatPage}
                      {" "}
                      /{" "}
                      {totalSeatPages}
                    </span>


                    <button
                      type="button"
                      disabled={
                        seatPage >=
                        totalSeatPages
                      }
                      onClick={() =>
                        setSeatPage(
                          (
                            page
                          ) =>
                            Math.min(
                              totalSeatPages,
                              page +
                                1
                            )
                        )
                      }
                    >

                      <ChevronRight
                        size={17}
                      />

                    </button>

                  </div>

                </div>

              </div>

            </section>
          )}


          {/* =================================
              ACTIVITY SECTION
          ================================= */}

          {activeSection ===
            "activity" && (

            <section className="admin-section">

              <div className="admin-section-intro">

                <div>

                  <span className="admin-eyebrow">
                    ATTENDANCE AUDIT
                  </span>

                  <h2>
                    Check-In / Check-Out Activity
                  </h2>

                  <p>
                    Exact server-recorded attendance
                    timestamps for every user.
                  </p>

                </div>


                <div className="admin-attendance-header-stats">

                  <div>

                    <span>
                      Check-Ins
                    </span>

                    <strong>
                      {attendanceCheckIns}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Check-Outs
                    </span>

                    <strong>
                      {attendanceCheckOuts}
                    </strong>

                  </div>

                </div>


                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={() =>
                    setShowQrScanner(true)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  <ScanLine
                    size={17}
                  />
                  Scan QR for Check-In
                </button>

              </div>


              <div className="admin-panel">

                <div className="admin-panel-heading">

                  <div>

                    <h3>
                      Attendance Records
                    </h3>

                    <p>
                      Actual times recorded by
                      the backend server.
                    </p>

                  </div>

                </div>


                <div className="admin-table-wrapper">

                  <table className="admin-table admin-activity-table">

                    <thead>

                      <tr>

                        <th>
                          USER
                        </th>

                        <th>
                          SEAT
                        </th>

                        <th>
                          SCHEDULED START
                        </th>

                        <th>
                          SCHEDULED END
                        </th>

                        <th>
                          ACTUAL CHECK-IN
                        </th>

                        <th>
                          ACTUAL CHECK-OUT
                        </th>

                        <th>
                          STATUS
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {attendanceRecords.map(
                        (
                          reservation
                        ) => {

                          const status =
                            getAttendanceStatus(
                              reservation
                            );


                          return (
                            <tr
                              key={
                                reservation?._id ||
                                reservation?.id
                              }
                            >

                              <td>

                                <div className="admin-user-cell">

                                  <strong>
                                    {getUserName(
                                      reservation
                                    )}
                                  </strong>

                                  <span>
                                    {getUserEmail(
                                      reservation
                                    )}
                                  </span>

                                </div>

                              </td>


                              <td>

                                <strong>
                                  {getSeatNumber(
                                    reservation
                                  )}
                                </strong>

                              </td>


                              <td>
                                {formatExactDateTime(
                                  reservation?.startTime
                                )}
                              </td>


                              <td>
                                {formatExactDateTime(
                                  reservation?.endTime
                                )}
                              </td>


                              <td>

                                <div className="admin-attendance-time">

                                  <UserCheck
                                    size={15}
                                  />

                                  <span
                                    className={
                                      getValidCheckInTime(
                                        reservation
                                      )
                                        ? ""
                                        : "empty"
                                    }
                                  >
                                    {formatExactDateTime(
                                      getValidCheckInTime(
                                        reservation
                                      )
                                    )}
                                  </span>

                                </div>

                              </td>


                              <td>

                                <div className="admin-attendance-time">

                                  <LogOut
                                    size={15}
                                  />

                                  <span
                                    className={
                                      getValidCheckOutTime(
                                        reservation
                                      )
                                        ? ""
                                        : "empty"
                                    }
                                  >
                                    {formatExactDateTime(
                                      getValidCheckOutTime(
                                        reservation
                                      )
                                    )}
                                  </span>

                                </div>

                              </td>


                              <td>

                                <span
                                  className={`admin-status-badge ${status}`}
                                >

                                  <span />

                                  {status ===
                                    "booked" &&
                                    "Booked"}

                                  {status ===
                                    "checked-in" &&
                                    "Checked In"}

                                  {status ===
                                    "completed" &&
                                    "Completed"}

                                  {status ===
                                    "cancelled" &&
                                    "Cancelled"}

                                  {status ===
                                    "expired" &&
                                    "Expired"}

                                </span>

                              </td>

                            </tr>
                          );

                        }
                      )}


                      {!(
                        activity.length ||
                        reservations.some(
                          (
                            reservation
                          ) =>
                            reservation?.checkedInAt ||
                            reservation?.checkedOutAt
                        )
                      ) && (
                        <tr>

                          <td
                            colSpan={
                              7
                            }
                            className="admin-empty-cell"
                          >

                            No check-in or
                            check-out activity
                            has been recorded yet.

                          </td>

                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>
          )}


          {/* =================================
              SETTINGS SECTION
          ================================= */}

          {activeSection ===
            "settings" && (

            <section className="admin-section">

              <div className="admin-section-intro">

                <div>

                  <span className="admin-eyebrow">
                    ADMINISTRATION
                  </span>

                  <h2>
                    Settings
                  </h2>

                  <p>
                    Administrator account and
                    system information.
                  </p>

                </div>

              </div>


              <div className="admin-settings-grid">

                <div className="admin-panel admin-settings-card">

                  <div className="admin-settings-icon">

                    <ShieldCheck
                      size={22}
                    />

                  </div>

                  <div>

                    <h3>
                      Administrator Account
                    </h3>

                    <p>
                      {user?.name ||
                        "Administrator"}
                    </p>

                    <span>
                      {user?.email ||
                        "—"}
                    </span>

                  </div>

                </div>


                <div className="admin-panel admin-settings-card">

                  <div className="admin-settings-icon">

                    <BarChart3
                      size={22}
                    />

                  </div>

                  <div>

                    <h3>
                      Reservation Analytics
                    </h3>

                    <p>
                      {totalReservations}
                      {" "}
                      total reservations
                    </p>

                    <span>
                      {totalCheckIns}
                      {" "}
                      check-ins ·{" "}
                      {totalCheckOuts}
                      {" "}
                      check-outs
                    </span>

                  </div>

                </div>

              </div>

            </section>
          )}

        </div>

      </main>


      {/* =====================================
          ADMIN CANCEL MODAL
      ===================================== */}

      {showCancelModal &&
        selectedReservation && (

        <div className="admin-modal-backdrop">

          <div className="admin-modal admin-cancel-modal">

            <div className="admin-modal-header">

              <div className="admin-modal-danger-icon">

                <Ban
                  size={22}
                />

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  closeCancelModal
                }
              >
                <X
                  size={19}
                />
              </button>

            </div>


            <div className="admin-modal-body">

              <h2>
                Cancel Reservation?
              </h2>

              <p>
                You are about to cancel the
                following reservation as an
                administrator.
              </p>


              <div className="admin-cancel-details">

                <div>

                  <span>
                    User
                  </span>

                  <strong>
                    {getUserName(
                      selectedReservation
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Seat
                  </span>

                  <strong>
                    {getSeatNumber(
                      selectedReservation
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Reservation
                  </span>

                  <strong>
                    {formatExactDateTime(
                      selectedReservation?.startTime
                    )}
                  </strong>

                </div>

              </div>


              <div className="admin-warning-box">

                <AlertCircle
                  size={17}
                />

                <span>
                  This action will cancel the
                  reservation and release its
                  booking status.
                </span>

              </div>

            </div>


            <div className="admin-modal-footer">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  closeCancelModal
                }
              >
                Keep Reservation
              </button>


              <button
                type="button"
                className="admin-danger-button"
                onClick={
                  handleAdminCancelReservation
                }
              >

                <Ban
                  size={16}
                />

                Cancel Reservation

              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================
          SEAT MODAL
      ===================================== */}

      {showSeatModal && (

        <div className="admin-modal-backdrop">

          <form
            className="admin-modal admin-seat-modal"
            onSubmit={
              handleSaveSeat
            }
          >

            <div className="admin-modal-header">

              <div>

                <span className="admin-eyebrow">
                  SEAT MANAGEMENT
                </span>

                <h2>
                  {selectedSeat
                    ? "Edit Seat"
                    : "Add Seat"}
                </h2>

              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  closeSeatModal
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            <div className="admin-modal-body">

              <div className="admin-form-grid">

                <label className="admin-form-field">

                  <span>
                    Seat Number
                  </span>

                  <input
                    type="text"
                    value={
                      seatForm.seatNumber
                    }
                    onChange={(event) =>
                      setSeatForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          seatNumber:
                            event.target.value,
                        })
                      )
                    }
                    required
                  />

                </label>


                <label className="admin-form-field">

                  <span>
                    Floor
                  </span>

                  <input
                    type="text"
                    value={
                      seatForm.floor
                    }
                    onChange={(event) =>
                      setSeatForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          floor:
                            event.target.value,
                        })
                      )
                    }
                    required
                  />

                </label>


                <label className="admin-form-field">

                  <span>
                    Zone
                  </span>

                  <input
                    type="text"
                    value={
                      seatForm.zone
                    }
                    onChange={(event) =>
                      setSeatForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          zone:
                            event.target.value,
                        })
                      )
                    }
                  />

                </label>


                <label className="admin-form-field">

                  <span>
                    Status
                  </span>

                  <select
                    value={
                      seatForm.status
                    }
                    onChange={(event) =>
                      setSeatForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          status:
                            event.target.value,
                        })
                      )
                    }
                  >

                    <option value="available">
                      Available
                    </option>

                    <option value="occupied">
                      Occupied
                    </option>

                    <option value="maintenance">
                      Maintenance
                    </option>

                  </select>

                </label>

              </div>


              <label className="admin-checkbox-field">

                <input
                  type="checkbox"
                  checked={
                    seatForm.isActive
                  }
                  onChange={(event) =>
                    setSeatForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        isActive:
                          event.target.checked,
                      })
                    )
                  }
                />

                <span>
                  Seat is active
                </span>

              </label>

            </div>


            <div className="admin-modal-footer">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  closeSeatModal
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="admin-primary-button"
              >

                <CheckCircle2
                  size={16}
                />

                {selectedSeat
                  ? "Save Changes"
                  : "Create Seat"}

              </button>

            </div>

          </form>

        </div>
      )}



      {/* =====================================
          DIGITAL QR CHECK-IN SCANNER
      ===================================== */}

      {showQrScanner && (

        <QRScanner
          token={token}
          onSuccess={
            handleQrCheckInSuccess
          }
          onClose={() =>
            setShowQrScanner(false)
          }
        />

      )}
    </div>
  );
}


export default AdminDashboard;