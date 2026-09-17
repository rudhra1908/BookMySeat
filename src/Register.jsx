import {
  useState,
} from "react";

import "./Register.css";

import {
  api,
} from "./services/api";

import {
  useAuth,
} from "./AuthContext";


function Register({
  goHome,
  goLogin,
  registerSuccess,
}) {

  /* =========================================
     AUTH
  ========================================= */

  const {
    login,
  } = useAuth();


  /* =========================================
     STATES
  ========================================= */

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [
    formData,
    setFormData,
  ] = useState({

    firstName: "",

    lastName: "",

    email: "",

    mobile: "",

    studentId: "",

    password: "",

    confirmPassword: "",

    terms: false,

  });


  const [
    errors,
    setErrors,
  ] = useState({});


  const [
    touched,
    setTouched,
  ] = useState({});


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    serverError,
    setServerError,
  ] = useState("");


  /* =========================================
     VALIDATION
  ========================================= */

  const validateField =
    (
      name,
      value,
      allData = formData
    ) => {

      const trimmedValue =

        typeof value === "string"

          ? value.trim()

          : value;


      switch (name) {


        case "firstName":

          if (!trimmedValue) {

            return "First name is required";

          }

          if (
            trimmedValue.length < 2
          ) {

            return "Name must contain at least 2 characters";

          }

          if (
            trimmedValue.length > 30
          ) {

            return "Name cannot exceed 30 characters";

          }

          if (
            !/^[A-Za-z\s]+$/.test(
              trimmedValue
            )
          ) {

            return "Only letters are allowed";

          }

          return "";


        case "lastName":

          if (!trimmedValue) {

            return "Last name is required";

          }

          if (
            trimmedValue.length < 2
          ) {

            return "Name must contain at least 2 characters";

          }

          if (
            trimmedValue.length > 30
          ) {

            return "Name cannot exceed 30 characters";

          }

          if (
            !/^[A-Za-z\s]+$/.test(
              trimmedValue
            )
          ) {

            return "Only letters are allowed";

          }

          return "";


        case "email":

          if (!trimmedValue) {

            return "Email address is required";

          }

          if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
              trimmedValue
            )
          ) {

            return "Enter a valid email address";

          }

          return "";


        case "mobile":

          if (!trimmedValue) {

            return "Mobile number is required";

          }

          if (
            !/^[6-9]\d{9}$/.test(
              trimmedValue
            )
          ) {

            return "Enter a valid 10-digit mobile number";

          }

          return "";


        case "studentId":

          if (!trimmedValue) {

            return "Student ID is required";

          }

          if (
            trimmedValue.length < 5
          ) {

            return "Student ID must contain at least 5 characters";

          }

          return "";


        case "password":

          if (!value) {

            return "Password is required";

          }

          if (
            value.length < 8
          ) {

            return "Password must contain at least 8 characters";

          }

          if (
            !/[A-Z]/.test(value)
          ) {

            return "Include at least one uppercase letter";

          }

          if (
            !/[a-z]/.test(value)
          ) {

            return "Include at least one lowercase letter";

          }

          if (
            !/\d/.test(value)
          ) {

            return "Include at least one number";

          }

          return "";


        case "confirmPassword":

          if (!value) {

            return "Please confirm your password";

          }

          if (
            value !==
            allData.password
          ) {

            return "Passwords do not match";

          }

          return "";


        case "terms":

          if (!value) {

            return "You must accept the terms to continue";

          }

          return "";


        default:

          return "";

      }

    };


  /* =========================================
     HANDLE CHANGE
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


      const newValue =

        type === "checkbox"

          ? checked

          : value;


      const updatedData = {

        ...formData,

        [name]:
          newValue,

      };


      setFormData(
        updatedData
      );


      setServerError("");


      if (
        touched[name]
      ) {

        setErrors(
          (
            previousErrors
          ) => ({

            ...previousErrors,

            [name]:

              validateField(
                name,
                newValue,
                updatedData
              ),

          })
        );

      }


      if (
        name === "password" &&
        touched.confirmPassword
      ) {

        setErrors(
          (
            previousErrors
          ) => ({

            ...previousErrors,

            confirmPassword:

              validateField(
                "confirmPassword",
                updatedData.confirmPassword,
                updatedData
              ),

          })
        );

      }

    };


  /* =========================================
     HANDLE BLUR
  ========================================= */

  const handleBlur =
    (
      e
    ) => {

      const {
        name,
        value,
        type,
        checked,
      } = e.target;


      const fieldValue =

        type === "checkbox"

          ? checked

          : value;


      setTouched(
        (
          previousTouched
        ) => ({

          ...previousTouched,

          [name]:
            true,

        })
      );


      setErrors(
        (
          previousErrors
        ) => ({

          ...previousErrors,

          [name]:

            validateField(
              name,
              fieldValue,
              formData
            ),

        })
      );

    };


  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit =
    async (
      e
    ) => {

      e.preventDefault();


      const newErrors = {};


      Object.keys(
        formData
      ).forEach(
        (
          field
        ) => {

          const error =
            validateField(
              field,
              formData[field],
              formData
            );


          if (error) {

            newErrors[field] =
              error;

          }

        }
      );


      setTouched({

        firstName: true,

        lastName: true,

        email: true,

        mobile: true,

        studentId: true,

        password: true,

        confirmPassword: true,

        terms: true,

      });


      setErrors(
        newErrors
      );


      if (
        Object.keys(
          newErrors
        ).length > 0
      ) {

        return;

      }


      try {

        setSubmitting(
          true
        );

        setServerError("");


        const name =

          `${formData.firstName.trim()} ${formData.lastName.trim()}`;


        const data =
          await api.register({

            name,

            email:
              formData.email.trim(),

            password:
              formData.password,

            studentId:
              formData.studentId.trim(),

          });


        const token =
          data?.token;


        const user =
          data?.user;


        if (
          !token ||
          !user
        ) {

          throw new Error(
            "Account was created but authentication information was not received."
          );

        }


        /* =====================================
           UPDATE AUTH CONTEXT
        ===================================== */

        login(
          user,
          token
        );


        registerSuccess?.(
          user
        );


      } catch (
        error
      ) {

        console.error(
          "Registration error:",
          error
        );


        setServerError(

          error?.message ||

          "Failed to create account."

        );

      } finally {

        setSubmitting(
          false
        );

      }

    };


  return (

    <div className="register-page">

      <div className="register-bg register-bg-one"></div>

      <div className="register-bg register-bg-two"></div>

      <div className="register-grid"></div>


      <nav className="register-nav">

        <button
          type="button"
          className="register-brand"
          onClick={goHome}
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
          className="register-back-btn"
          onClick={goHome}
        >

          ← Back to home

        </button>

      </nav>


      <main className="register-container">


        <section className="register-info">

          <div className="register-info-content">

            <div className="register-pill">

              <span></span>

              JOIN BOOKMYSEAT TODAY

            </div>


            <h1>

              Make every study

              <span>
                session count.
              </span>

            </h1>


            <p>

              Create your account and get quick
              access to smart seat reservations,
              booking management, and your
              personal study space.

            </p>


            <div className="register-steps">

              <div className="register-step">

                <div className="step-circle">
                  1
                </div>

                <div>

                  <strong>
                    Create your account
                  </strong>

                  <span>
                    Set up your BookMySeat profile
                  </span>

                </div>

              </div>


              <div className="step-line"></div>


              <div className="register-step">

                <div className="step-circle">
                  2
                </div>

                <div>

                  <strong>
                    Choose your seat
                  </strong>

                  <span>
                    Explore available study spaces
                  </span>

                </div>

              </div>


              <div className="step-line"></div>


              <div className="register-step">

                <div className="step-circle">
                  3
                </div>

                <div>

                  <strong>
                    Start studying
                  </strong>

                  <span>
                    Enjoy a smooth library experience
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        <section className="register-form-wrapper">


          <div className="register-form-card">


            <div className="register-form-header">

              <p>
                CREATE ACCOUNT
              </p>


              <h2>

                Start your

                <span>
                  {" "}journey.
                </span>

              </h2>


              <div className="register-header-line">

                <span></span>

              </div>

            </div>


            {serverError && (

              <div
                style={{
                  marginBottom: "18px",
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    "1px solid rgba(220, 38, 38, 0.4)",
                }}
              >

                {serverError}

              </div>

            )}


            <form
              noValidate
              onSubmit={handleSubmit}
            >


              <div className="name-row">


                <div className="register-input-group">

                  <label>
                    FIRST NAME
                  </label>

                  <div
                    className={`register-input ${
                      errors.firstName &&
                      touched.firstName
                        ? "input-error"
                        : ""
                    }`}
                  >

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="First name"
                    />

                  </div>

                  {errors.firstName &&
                    touched.firstName && (

                      <p className="field-error">
                        ⚠ {errors.firstName}
                      </p>

                    )}

                </div>


                <div className="register-input-group">

                  <label>
                    LAST NAME
                  </label>

                  <div
                    className={`register-input ${
                      errors.lastName &&
                      touched.lastName
                        ? "input-error"
                        : ""
                    }`}
                  >

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Last name"
                    />

                  </div>

                  {errors.lastName &&
                    touched.lastName && (

                      <p className="field-error">
                        ⚠ {errors.lastName}
                      </p>

                    )}

                </div>


              </div>


              <div className="register-input-group">

                <label>
                  EMAIL ADDRESS
                </label>

                <div className="register-input">

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                  />

                </div>

                {errors.email &&
                  touched.email && (

                    <p className="field-error">
                      ⚠ {errors.email}
                    </p>

                  )}

              </div>


              <div className="register-input-group">

                <label>
                  MOBILE NUMBER
                </label>

                <div className="register-input">

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="10-digit mobile number"
                  />

                </div>

                {errors.mobile &&
                  touched.mobile && (

                    <p className="field-error">
                      ⚠ {errors.mobile}
                    </p>

                  )}

              </div>


              <div className="register-input-group">

                <label>
                  STUDENT ID
                </label>

                <div className="register-input">

                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter student ID"
                  />

                </div>

                {errors.studentId &&
                  touched.studentId && (

                    <p className="field-error">
                      ⚠ {errors.studentId}
                    </p>

                  )}

              </div>


              <div className="register-input-group">

                <label>
                  PASSWORD
                </label>

                <div className="register-input">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create password"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >

                    {showPassword
                      ? "◉"
                      : "○"}

                  </button>

                </div>

                {errors.password &&
                  touched.password && (

                    <p className="field-error">
                      ⚠ {errors.password}
                    </p>

                  )}

              </div>


              <div className="register-input-group">

                <label>
                  CONFIRM PASSWORD
                </label>

                <div className="register-input">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm password"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >

                    {showConfirmPassword
                      ? "◉"
                      : "○"}

                  </button>

                </div>

                {errors.confirmPassword &&
                  touched.confirmPassword && (

                    <p className="field-error">
                      ⚠ {errors.confirmPassword}
                    </p>

                  )}

              </div>


              <label className="register-terms">

                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />


                <span>
                  I agree to the terms and conditions
                </span>

              </label>


              {errors.terms &&
                touched.terms && (

                  <p className="field-error">
                    ⚠ {errors.terms}
                  </p>

                )}


              <button
                type="submit"
                className="register-submit-btn"
                disabled={submitting}
              >

                {submitting
                  ? "Creating account..."
                  : "Create Account"}

              </button>


            </form>


            <div className="register-footer">

              <p>

                Already have an account?


                <button
                  type="button"
                  onClick={goLogin}
                >

                  Sign in

                </button>

              </p>

            </div>


          </div>


        </section>


      </main>


    </div>

  );

}


export default Register;