import {
  useState,
} from "react";

import "./Login.css";

import {
  api,
} from "./services/api";

import {
  useAuth,
} from "./AuthContext";


function Login({
  goHome,
  goRegister,
  loginSuccess,
}) {


  /* =========================================
     AUTH CONTEXT
  ========================================= */

  const {

    login,

  } = useAuth();


  /* =========================================
     LOGIN TYPE

     student -> Normal student login

     admin   -> Administrator login
  ========================================= */

  const [

    loginType,

    setLoginType,

  ] =
    useState(
      "student"
    );


  /* =========================================
     SHOW PASSWORD
  ========================================= */

  const [

    showPassword,

    setShowPassword,

  ] =
    useState(
      false
    );


  /* =========================================
     FORM DATA
  ========================================= */

  const [

    formData,

    setFormData,

  ] =
    useState({

      email:
        "",

      password:
        "",

      remember:
        false,

    });


  /* =========================================
     VALIDATION ERRORS
  ========================================= */

  const [

    errors,

    setErrors,

  ] =
    useState(
      {}
    );


  /* =========================================
     SUBMITTING STATE
  ========================================= */

  const [

    isSubmitting,

    setIsSubmitting,

  ] =
    useState(
      false
    );


  /* =========================================
     SERVER ERROR
  ========================================= */

  const [

    serverError,

    setServerError,

  ] =
    useState(
      ""
    );


  /* =========================================
     VALIDATE FORM
  ========================================= */

  const validateForm =
    () => {


      const newErrors =
        {};


      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      /* EMAIL */

      if (
        !formData.email.trim()
      ) {

        newErrors.email =
          "Email address is required.";

      }

      else if (

        !emailRegex.test(
          formData.email.trim()
        )

      ) {

        newErrors.email =
          "Please enter a valid email address.";

      }


      /* PASSWORD */

      if (
        !formData.password
      ) {

        newErrors.password =
          "Password is required.";

      }

      else if (

        formData.password.length < 6

      ) {

        newErrors.password =
          "Password must contain at least 6 characters.";

      }


      setErrors(
        newErrors
      );


      return (

        Object.keys(
          newErrors
        ).length === 0

      );

    };


  /* =========================================
     HANDLE LOGIN TYPE CHANGE
  ========================================= */

  const handleLoginTypeChange =
    (
      type
    ) => {


      setLoginType(
        type
      );


      setServerError(
        ""
      );


      setErrors(
        {}
      );

    };


  /* =========================================
     HANDLE INPUT CHANGE
  ========================================= */

  const handleChange =
    (
      e
    ) => {


      const {

        name,

        value,

        type,

        checked,

      } = e.target;


      setFormData(
        (
          previousData
        ) => ({

          ...previousData,


          [name]:

            type === "checkbox"

              ? checked

              : value,

        })
      );


      if (
        errors[name]
      ) {

        setErrors(
          (
            previousErrors
          ) => ({

            ...previousErrors,


            [name]:
              "",

          })
        );

      }


      setServerError(
        ""
      );

    };


  /* =========================================
     HANDLE LOGIN
  ========================================= */

  const handleSubmit =
    async (
      e
    ) => {


      e.preventDefault();


      if (
        !validateForm()
      ) {

        return;

      }


      try {


        setIsSubmitting(
          true
        );


        setServerError(
          ""
        );


        /* =====================================
           API LOGIN
        ===================================== */

        const data =
          await api.login({

            email:

              formData.email
                .trim(),

            password:

              formData.password,

          });


        /* =====================================
           GET TOKEN
        ===================================== */

        const token =

          data?.token ||

          data?.accessToken ||

          data?.jwt ||

          null;


        /* =====================================
           GET USER
        ===================================== */

        const user =

          data?.user ||

          data?.student ||

          data?.admin ||

          null;


        /* =====================================
           CHECK TOKEN
        ===================================== */

        if (
          !token
        ) {

          throw new Error(

            "Login succeeded but no authentication token was received."

          );

        }


        /* =====================================
           CHECK USER
        ===================================== */

        if (
          !user
        ) {

          throw new Error(

            "Login succeeded but user information was not received."

          );

        }


        /* =====================================
           NORMALIZE ROLE
        ===================================== */

        const userRole =

          String(
            user.role ||
            "user"
          )
            .trim()
            .toLowerCase();


        /* =====================================
           ADMIN LOGIN VALIDATION
        ===================================== */

        if (

          loginType === "admin" &&

          userRole !== "admin"

        ) {

          throw new Error(

            "This account does not have administrator access. Please use Student Login."

          );

        }


        /* =====================================
           STUDENT LOGIN VALIDATION
        ===================================== */

        if (

          loginType === "student" &&

          userRole === "admin"

        ) {

          throw new Error(

            "This is an administrator account. Please select Admin Login."

          );

        }


        /* =====================================
           FINAL USER
        ===================================== */

        const finalUser = {

          ...user,


          name:

            user.name ||

            user.firstName ||

            "User",


          role:

            userRole,

        };


        /* =====================================
           SAVE AUTHENTICATION

           AuthContext saves:

           - token
           - user

           and updates React state.
        ===================================== */

        login(

          finalUser,

          token

        );


        /* =====================================
           APP NAVIGATION
        ===================================== */

        if (
          loginSuccess
        ) {

          loginSuccess(
            finalUser
          );

        }


      }

      catch (
        error
      ) {


        console.error(
          "Login error:",
          error
        );


        setServerError(

          error?.message ||

          "Unable to login. Please try again."

        );


      }

      finally {


        setIsSubmitting(
          false
        );


      }

    };


  return (

    <div className="login-page">


      {/* =====================================
         BACKGROUND
      ===================================== */}

      <div className="login-bg login-bg-one"></div>

      <div className="login-bg login-bg-two"></div>

      <div className="login-grid"></div>


      {/* =====================================
         NAVBAR
      ===================================== */}

      <nav className="login-nav">


        <button

          type="button"

          className="login-brand"

          onClick={
            goHome
          }

        >


          <div className="brand-icon">

            B

          </div>


          <div>


            <strong>

              BookMySeat

            </strong>


            <small>

              SMART RESERVATION SYSTEM

            </small>


          </div>


        </button>


        <button

          type="button"

          className="login-back-btn"

          onClick={
            goHome
          }

        >

          ← Back to home

        </button>


      </nav>


      {/* =====================================
         MAIN CONTAINER
      ===================================== */}

      <main className="login-container">


        {/* =====================================
           LEFT INFORMATION SECTION
        ===================================== */}

        <section className="login-info">


          <div className="login-info-content">


            <div className="login-pill">

              <span></span>

              WELCOME TO BOOKMYSEAT

            </div>


            <h1>

              Your perfect seat

              <span>

                {" "}is waiting.

              </span>

            </h1>


            <p>

              Sign in to manage your reservations,
              explore available study spaces, and make
              your library experience simple.

            </p>


            <div className="login-features">


              <div className="login-feature">


                <div className="feature-icon">

                  ▦

                </div>


                <div>


                  <strong>

                    Manage reservations

                  </strong>


                  <span>

                    View and control all your bookings

                  </span>


                </div>


              </div>


              <div className="login-feature">


                <div className="feature-icon">

                  ⌁

                </div>


                <div>


                  <strong>

                    Real-time availability

                  </strong>


                  <span>

                    Find the best available seat instantly

                  </span>


                </div>


              </div>


              <div className="login-feature">


                <div className="feature-icon">

                  ✓

                </div>


                <div>


                  <strong>

                    Quick check-in

                  </strong>


                  <span>

                    Use your digital reservation pass

                  </span>


                </div>


              </div>


            </div>


          </div>


          <div className="login-quote-card">


            <div className="quote-mark">

              “

            </div>


            <p>

              A smarter way to find your space,
              save your time, and focus on what matters.

            </p>


            <div className="quote-footer">


              <div className="quote-line"></div>


              <span>

                BOOKMYSEAT EXPERIENCE

              </span>


            </div>


          </div>


        </section>


        {/* =====================================
           LOGIN FORM
        ===================================== */}

        <section className="login-form-wrapper">


          <div className="login-form-card">


            {/* =================================
               HEADER
            ================================= */}

            <div className="login-form-header">


              <p>

                {loginType === "admin"

                  ? "ADMINISTRATOR ACCESS"

                  : "STUDENT ACCESS"

                }

              </p>


              <h2>

                {loginType === "admin"

                  ? "Admin"

                  : "Welcome"

                }


                <span>

                  {loginType === "admin"

                    ? " panel."

                    : " back."

                  }

                </span>

              </h2>


              <div className="login-header-line">

                <span></span>

              </div>


            </div>


            {/* =================================
               LOGIN TYPE SELECTOR
            ================================= */}

            <div className="login-type-selector">


              <button

                type="button"

                className={

                  loginType === "student"

                    ? "login-type-btn active"

                    : "login-type-btn"

                }

                onClick={() => {

                  handleLoginTypeChange(
                    "student"
                  );

                }}

              >


                <span className="login-type-icon">

                  🎓

                </span>


                <div>


                  <strong>

                    Student

                  </strong>


                  <small>

                    Access your reservations

                  </small>


                </div>


              </button>


              <button

                type="button"

                className={

                  loginType === "admin"

                    ? "login-type-btn active"

                    : "login-type-btn"

                }

                onClick={() => {

                  handleLoginTypeChange(
                    "admin"
                  );

                }}

              >


                <span className="login-type-icon">

                  🛡

                </span>


                <div>


                  <strong>

                    Admin

                  </strong>


                  <small>

                    Manage the system

                  </small>


                </div>


              </button>


            </div>


            {/* =================================
               SERVER ERROR
            ================================= */}

            {serverError && (

              <div className="login-server-error">

                ⚠

                <span>

                  {serverError}

                </span>

              </div>

            )}


            {/* =================================
               FORM
            ================================= */}

            <form

              onSubmit={
                handleSubmit
              }

              noValidate

            >


              {/* EMAIL */}

              <div className="login-input-group">


                <label>

                  EMAIL ADDRESS

                </label>


                <div

                  className={`login-input ${
                    errors.email
                      ? "input-error"
                      : ""
                  }`}

                >


                  <span className="login-input-icon">

                    ✉

                  </span>


                  <input

                    type="email"

                    name="email"

                    value={
                      formData.email
                    }

                    onChange={
                      handleChange
                    }

                    placeholder={
                      loginType === "admin"

                        ? "Enter admin email"

                        : "Enter your email"
                    }

                    autoComplete="email"

                  />


                </div>


                {errors.email && (

                  <p className="field-error">

                    ⚠ {errors.email}

                  </p>

                )}


              </div>


              {/* PASSWORD */}

              <div className="login-input-group">


                <div className="password-label-row">


                  <label>

                    PASSWORD

                  </label>


                  <button

                    type="button"

                    onClick={() => {

                      alert(
                        "Password recovery can be added later."
                      );

                    }}

                  >

                    Forgot password?

                  </button>


                </div>


                <div

                  className={`login-input ${
                    errors.password
                      ? "input-error"
                      : ""
                  }`}

                >


                  <span className="login-input-icon">

                    🔒

                  </span>


                  <input

                    type={
                      showPassword

                        ? "text"

                        : "password"
                    }

                    name="password"

                    value={
                      formData.password
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Enter your password"

                    autoComplete="current-password"

                  />


                  <button

                    type="button"

                    className="login-password-toggle"

                    onClick={() => {

                      setShowPassword(

                        (
                          previousValue
                        ) =>

                          !previousValue

                      );

                    }}

                  >

                    {showPassword

                      ? "◉"

                      : "○"

                    }

                  </button>


                </div>


                {errors.password && (

                  <p className="field-error">

                    ⚠ {errors.password}

                  </p>

                )}


              </div>


              {/* REMEMBER ME */}

              <label className="remember-me">


                <input

                  type="checkbox"

                  name="remember"

                  checked={
                    formData.remember
                  }

                  onChange={
                    handleChange
                  }

                />


                <span className="login-custom-checkbox"></span>


                <span>

                  Remember me for 30 days

                </span>


              </label>


              {/* SUBMIT */}

              <button

                type="submit"

                className="login-submit-btn"

                disabled={
                  isSubmitting
                }

              >


                <span>

                  {isSubmitting

                    ? "Signing you in..."

                    : loginType === "admin"

                      ? "Sign in as Admin"

                      : "Sign in to BookMySeat"

                  }

                </span>


                <span>

                  {isSubmitting

                    ? "..."

                    : "→"

                  }

                </span>


              </button>


            </form>


            {/* =================================
               DIVIDER
            ================================= */}

            <div className="login-divider">


              <span></span>


              <p>

                OR CONTINUE WITH

              </p>


              <span></span>


            </div>


            {/* =================================
               SOCIAL BUTTONS
            ================================= */}

            <div className="login-social">


              <button

                type="button"

                onClick={() => {

                  alert(
                    "Google authentication can be connected later."
                  );

                }}

              >


                <b>

                  G

                </b>


                Google


              </button>


              <button

                type="button"

                onClick={() => {

                  alert(
                    "Student ID authentication can be connected later."
                  );

                }}

              >


                <b>

                  ◉

                </b>


                Student ID


              </button>


            </div>


            {/* =================================
               REGISTER

               Only show for student login.
            ================================= */}

            {loginType === "student" && (

              <div className="login-footer">


                <p>

                  Don't have an account?


                  <button

                    type="button"

                    onClick={
                      goRegister
                    }

                  >

                    Create account

                  </button>


                </p>


              </div>

            )}


            {loginType === "admin" && (

              <div className="login-footer admin-login-footer">


                <p>

                  Administrator accounts are managed
                  by the system administrator.

                </p>


              </div>

            )}


          </div>


          <p className="login-security">

            🔒 Secure access to BookMySeat

          </p>


        </section>


      </main>


    </div>

  );

}


export default Login;