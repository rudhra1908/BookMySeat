import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";


const AuthContext =
  createContext(
    null
  );


/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({
  children,
}) {


  /* =========================================
     LOAD SAVED USER
  ========================================= */

  const [
    user,
    setUser,
  ] =
    useState(
      () => {

        try {

          const savedUser =
            localStorage.getItem(
              "bookmyseat_user"
            );


          if (
            !savedUser
          ) {

            return null;

          }


          return JSON.parse(
            savedUser
          );

        }

        catch (
          error
        ) {

          console.error(
            "Failed to load saved user:",
            error
          );


          localStorage.removeItem(
            "bookmyseat_user"
          );


          return null;

        }

      }
    );


  /* =========================================
     LOAD SAVED TOKEN
  ========================================= */

  const [
    token,
    setTokenState,
  ] =
    useState(
      () => {

        try {

          return (

            localStorage.getItem(
              "token"
            )

            ||

            null

          );

        }

        catch (
          error
        ) {

          console.error(
            "Failed to load saved token:",
            error
          );


          return null;

        }

      }
    );


  /* =========================================
     LOGIN

     This function is used for both:

     1. Student login
     2. Admin login

     The backend sends:

     {
       token: "...",
       user: {
         name: "...",
         email: "...",
         role: "user" or "admin"
       }
     }
  ========================================= */

  const login =
    (
      userData,
      authToken
    ) => {

      try {


        /* =====================================
           SAVE TOKEN
        ====================================== */

        if (
          authToken
        ) {

          localStorage.setItem(
            "token",
            authToken
          );


          setTokenState(
            authToken
          );

        }

        else {

          localStorage.removeItem(
            "token"
          );


          setTokenState(
            null
          );

        }


        /* =====================================
           FORMAT USER
        ====================================== */

        if (
          userData
        ) {

          const finalUser = {

            ...userData,


            role:

              userData.role ||

              "user",

          };


          /* ===================================
             SAVE USER
          ==================================== */

          localStorage.setItem(
            "bookmyseat_user",
            JSON.stringify(
              finalUser
            )
          );


          setUser(
            finalUser
          );

        }

        else {

          localStorage.removeItem(
            "bookmyseat_user"
          );


          setUser(
            null
          );

        }


      }

      catch (
        error
      ) {

        console.error(
          "Login state update failed:",
          error
        );


        /* =====================================
           IF LOGIN STORAGE FAILS,
           CLEAR EVERYTHING
        ====================================== */

        localStorage.removeItem(
          "token"
        );


        localStorage.removeItem(
          "bookmyseat_user"
        );


        setTokenState(
          null
        );


        setUser(
          null
        );

      }

    };


  /* =========================================
     LOGOUT

     REAL LOGOUT

     This will:

     1. Remove JWT token
     2. Remove saved user
     3. Clear React authentication state
     4. Remove any temporary auth-related data
     5. Make isAuthenticated false
     6. Remove admin/student access
  ========================================= */

  const logout =
    () => {

      try {


        /* =====================================
           REMOVE AUTHENTICATION DATA
        ====================================== */

        localStorage.removeItem(
          "token"
        );


        localStorage.removeItem(
          "bookmyseat_user"
        );


        /* =====================================
           OPTIONAL TEMPORARY AUTH DATA
        ====================================== */

        localStorage.removeItem(
          "user"
        );


        localStorage.removeItem(
          "authToken"
        );


        localStorage.removeItem(
          "admin_token"
        );


        localStorage.removeItem(
          "admin_user"
        );


      }

      catch (
        error
      ) {

        console.error(
          "Failed to clear authentication:",
          error
        );

      }


      /* =====================================
         CLEAR REACT STATE

         This is important.

         Even if localStorage is cleared,
         React components must immediately
         know that the user is logged out.
      ====================================== */

      setUser(
        null
      );


      setTokenState(
        null
      );

    };


  /* =========================================
     UPDATE USER
  ========================================= */

  const updateUser =
    (
      updatedUser
    ) => {

      if (
        !updatedUser
      ) {

        return;

      }


      try {

        const finalUser = {

          ...updatedUser,


          role:

            updatedUser.role ||

            user?.role ||

            "user",

        };


        localStorage.setItem(
          "bookmyseat_user",
          JSON.stringify(
            finalUser
          )
        );


        setUser(
          finalUser
        );

      }

      catch (
        error
      ) {

        console.error(
          "Failed to save updated user:",
          error
        );

      }

    };


  /* =========================================
     SET TOKEN

     Used when token needs to be updated
     manually.
  ========================================= */

  const setToken =
    (
      newToken
    ) => {

      try {

        if (
          newToken
        ) {

          localStorage.setItem(
            "token",
            newToken
          );


          setTokenState(
            newToken
          );

        }

        else {

          localStorage.removeItem(
            "token"
          );


          setTokenState(
            null
          );

        }

      }

      catch (
        error
      ) {

        console.error(
          "Failed to update token:",
          error
        );

      }

    };


  /* =========================================
     AUTHENTICATION STATUS
  ========================================= */

  const isAuthenticated =
    Boolean(
      user &&
      token
    );


  /* =========================================
     ROLE CHECKING
  ========================================= */

  const isAdmin =

    isAuthenticated

    &&

    user?.role ===
    "admin";


  const isStudent =

    isAuthenticated

    &&

    user?.role !==
    "admin";


  /* =========================================
     CONTEXT VALUE
  ========================================= */

  const value =
    useMemo(
      () => ({

        /* ===============================
           USER DATA
        =============================== */

        user,

        token,


        /* ===============================
           AUTH STATUS
        =============================== */

        isAuthenticated,

        isAdmin,

        isStudent,


        /* ===============================
           AUTH FUNCTIONS
        =============================== */

        login,

        logout,

        updateUser,

        setUser,

        setToken,

      }),
      [

        user,

        token,

        isAuthenticated,

        isAdmin,

        isStudent,

      ]
    );


  /* =========================================
     PROVIDER
  ========================================= */

  return (

    <AuthContext.Provider
      value={
        value
      }
    >

      {
        children
      }

    </AuthContext.Provider>

  );

}


/* =========================================
   USE AUTH HOOK
========================================= */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (
    !context
  ) {

    throw new Error(
      "useAuth must be used within an AuthProvider"
    );

  }


  return context;

}


export default AuthContext;