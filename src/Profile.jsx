import { useState } from "react";
import "./Profile.css";

function Profile({
  user,
  updateUser,
  goHome,
  goDashboard,
  goReservations,
  goSeats,
  goSupport,
  forgotPassword,
  switchAccount,
  logout,
}) {
  // SAFE USER DATA
  const safeUser = {
    name: user?.name || "Student",
    email: user?.email || "",
    phone: user?.phone || "",
    studentId: user?.studentId || "",
    department: user?.department || "Computer Science",
    year: user?.year || "",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showForgotPassword, setShowForgotPassword] =
    useState(false);
  const [showSwitchModal, setShowSwitchModal] =
    useState(false);
  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [forgotEmail, setForgotEmail] = useState(
    safeUser.email
  );

  const [resetMessage, setResetMessage] =
    useState("");

  const [formData, setFormData] = useState({
    name: safeUser.name,
    email: safeUser.email,
    phone: safeUser.phone,
    studentId: safeUser.studentId,
    department: safeUser.department,
    year: safeUser.year,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (updateUser) {
      updateUser({
        ...safeUser,
        ...formData,
      });
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: safeUser.name,
      email: safeUser.email,
      phone: safeUser.phone,
      studentId: safeUser.studentId,
      department: safeUser.department,
      year: safeUser.year,
    });

    setIsEditing(false);
  };

  const handleForgotPassword = () => {
    if (!forgotEmail.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (forgotPassword) {
      forgotPassword(forgotEmail);
    }

    setResetMessage(
      "Password reset instructions have been sent to your email."
    );
  };

  const handleSwitchAccount = () => {
    setShowSwitchModal(false);

    if (switchAccount) {
      switchAccount();
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);

    if (logout) {
      logout();
    }
  };

  const getInitials = () => {
    return safeUser.name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="profile-page">

      <div className="profile-bg profile-bg-one"></div>
      <div className="profile-bg profile-bg-two"></div>

      {/* NAVBAR */}

      <nav className="profile-nav">

        <button
          type="button"
          className="profile-brand"
          onClick={() => goHome?.()}
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


        <div className="profile-nav-actions">

          <button
            type="button"
            onClick={() =>
              goReservations?.()
            }
          >
            My Reservations
          </button>


          <button
            type="button"
            className="profile-home-btn"
            onClick={() =>
              goHome?.()
            }
          >
            Home
          </button>

        </div>

      </nav>


      <main className="profile-container">

        {/* PAGE HEADING */}

        <div className="profile-page-heading">

          <div>

            <p className="profile-eyebrow">
              ACCOUNT SETTINGS
            </p>

            <h1>
              Your
              <span>
                {" "}profile.
              </span>
            </h1>

            <p>
              Manage your personal information and
              BookMySeat account details.
            </p>

          </div>


          <button
            type="button"
            className="edit-profile-btn"
            onClick={() =>
              setIsEditing(
                (previous) => !previous
              )
            }
          >
            {isEditing
              ? "Cancel editing"
              : "✎ Edit profile"}
          </button>

        </div>


        <div className="profile-layout">

          {/* LEFT SIDEBAR */}

          <aside className="profile-sidebar">

            <div className="profile-card">

              <div className="profile-cover"></div>


              <div className="profile-avatar-wrapper">

                <div className="profile-avatar">
                  {getInitials()}
                </div>

                <div className="profile-online-dot"></div>

              </div>


              <div className="profile-main-info">

                <h2>
                  {safeUser.name}
                </h2>

                <p>
                  {safeUser.studentId || "Student"}
                </p>


                <div className="profile-active-badge">

                  <span></span>

                  ACTIVE ACCOUNT

                </div>

              </div>


              <div className="profile-quick-stats">

                <div>
                  <strong>
                    12
                  </strong>

                  <span>
                    Total Bookings
                  </span>
                </div>


                <div>
                  <strong>
                    08
                  </strong>

                  <span>
                    Completed
                  </span>
                </div>


                <div>
                  <strong>
                    04
                  </strong>

                  <span>
                    This Month
                  </span>
                </div>

              </div>

            </div>


            {/* PROFILE MENU */}

            <div className="profile-menu">

              <button
                type="button"
                className="profile-menu-active"
              >
                <span>
                  ◉
                </span>

                Profile overview
              </button>


              <button
                type="button"
                onClick={() =>
                  goReservations?.()
                }
              >
                <span>
                  ▣
                </span>

                My reservations
              </button>


              <button
                type="button"
                onClick={() =>
                  goSeats?.()
                }
              >
                <span>
                  ⌖
                </span>

                Find a seat
              </button>


              <button
                type="button"
                onClick={() =>
                  goSupport?.()
                }
              >
                <span>
                  ?
                </span>

                Help & support
              </button>

            </div>


            {/* ACCOUNT ACTIONS */}

            <div className="profile-menu profile-account-actions">

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(
                    safeUser.email
                  );

                  setResetMessage("");

                  setShowForgotPassword(
                    true
                  );
                }}
              >
                <span>
                  🔑
                </span>

                Forgot password
              </button>


              <button
                type="button"
                onClick={() =>
                  setShowSwitchModal(true)
                }
              >
                <span>
                  ⇄
                </span>

                Switch account
              </button>


              <button
                type="button"
                className="profile-logout-btn"
                onClick={() =>
                  setShowLogoutModal(true)
                }
              >
                <span>
                  ⎋
                </span>

                Logout
              </button>

            </div>


            <div className="profile-security-card">

              <div className="profile-security-icon">
                🔒
              </div>


              <div>

                <strong>
                  Account secured
                </strong>

                <p>
                  Your BookMySeat account is active
                  and protected.
                </p>

              </div>

            </div>

          </aside>


          {/* RIGHT CONTENT */}

          <section className="profile-content">

            {/* PERSONAL INFORMATION */}

            <div className="profile-section-card">

              <div className="profile-section-header">

                <div>

                  <p>
                    PERSONAL INFORMATION
                  </p>

                  <h2>
                    Profile details
                  </h2>

                </div>


                <span className="profile-section-number">
                  01
                </span>

              </div>


              <div className="profile-fields">

                {/* FULL NAME */}

                <div className="profile-field">

                  <label>
                    FULL NAME
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />

                  ) : (

                    <div className="profile-value">
                      {safeUser.name}
                    </div>

                  )}

                </div>


                {/* EMAIL */}

                <div className="profile-field">

                  <label>
                    EMAIL ADDRESS
                  </label>

                  {isEditing ? (

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />

                  ) : (

                    <div className="profile-value">
                      {safeUser.email}
                    </div>

                  )}

                </div>


                {/* PHONE */}

                <div className="profile-field">

                  <label>
                    PHONE NUMBER
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />

                  ) : (

                    <div className="profile-value">
                      {safeUser.phone}
                    </div>

                  )}

                </div>


                {/* STUDENT ID */}

                <div className="profile-field">

                  <label>
                    STUDENT ID
                  </label>

                  <div className="profile-value profile-locked-value">

                    {safeUser.studentId}

                    <span>
                      🔒 Verified
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* ACADEMIC DETAILS */}

            <div className="profile-section-card">

              <div className="profile-section-header">

                <div>

                  <p>
                    ACADEMIC INFORMATION
                  </p>

                  <h2>
                    Student details
                  </h2>

                </div>


                <span className="profile-section-number">
                  02
                </span>

              </div>


              <div className="profile-fields">

                {/* DEPARTMENT */}

                <div className="profile-field">

                  <label>
                    DEPARTMENT
                  </label>

                  {isEditing ? (

                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >

                      <option>
                        Computer Science
                      </option>

                      <option>
                        Information Technology
                      </option>

                      <option>
                        Electronics Engineering
                      </option>

                      <option>
                        Mechanical Engineering
                      </option>

                    </select>

                  ) : (

                    <div className="profile-value">
                      {safeUser.department}
                    </div>

                  )}

                </div>


                {/* YEAR */}

                <div className="profile-field">

                  <label>
                    CURRENT YEAR
                  </label>

                  {isEditing ? (

                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                    >

                      <option>
                        1st Year
                      </option>

                      <option>
                        2nd Year
                      </option>

                      <option>
                        3rd Year
                      </option>

                      <option>
                        4th Year
                      </option>

                    </select>

                  ) : (

                    <div className="profile-value">
                      {safeUser.year}
                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* ACCOUNT ACTIVITY */}

            <div className="profile-section-card profile-activity-card">

              <div className="profile-section-header">

                <div>

                  <p>
                    ACCOUNT ACTIVITY
                  </p>

                  <h2>
                    Your BookMySeat activity
                  </h2>

                </div>


                <span className="profile-section-number">
                  03
                </span>

              </div>


              <div className="profile-activity-grid">

                <div className="activity-box">

                  <div className="activity-icon">
                    🪑
                  </div>

                  <div>

                    <span>
                      SEATS RESERVED
                    </span>

                    <strong>
                      12
                    </strong>

                    <small>
                      Total reservations
                    </small>

                  </div>

                </div>


                <div className="activity-box">

                  <div className="activity-icon">
                    ✓
                  </div>

                  <div>

                    <span>
                      SUCCESS RATE
                    </span>

                    <strong>
                      96%
                    </strong>

                    <small>
                      Completed successfully
                    </small>

                  </div>

                </div>


                <div className="activity-box">

                  <div className="activity-icon">
                    ◷
                  </div>

                  <div>

                    <span>
                      MEMBER SINCE
                    </span>

                    <strong>
                      2026
                    </strong>

                    <small>
                      BookMySeat member
                    </small>

                  </div>

                </div>

              </div>

            </div>


            {/* SAVE ACTIONS */}

            {isEditing && (

              <div className="profile-save-actions">

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={handleSave}
                >
                  Save changes

                  <span>
                    →
                  </span>
                </button>

              </div>

            )}

          </section>

        </div>

      </main>


      {/* FORGOT PASSWORD MODAL */}

      {showForgotPassword && (

        <div className="profile-modal-overlay">

          <div className="profile-modal">

            <div className="profile-modal-icon">
              🔑
            </div>


            <h2>
              Forgot password?
            </h2>


            <p>
              Enter your email address and we'll
              send you password reset instructions.
            </p>


            {!resetMessage ? (

              <>

                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(event) =>
                    setForgotEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter your email"
                  className="profile-modal-input"
                />


                <div className="profile-modal-actions">

                  <button
                    type="button"
                    className="profile-modal-cancel"
                    onClick={() => {
                      setShowForgotPassword(
                        false
                      );

                      setResetMessage("");
                    }}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="profile-modal-primary"
                    onClick={handleForgotPassword}
                  >
                    Send reset link
                  </button>

                </div>

              </>

            ) : (

              <>

                <div className="profile-reset-success">
                  ✓ {resetMessage}
                </div>


                <div className="profile-modal-actions">

                  <button
                    type="button"
                    className="profile-modal-primary"
                    onClick={() => {
                      setShowForgotPassword(
                        false
                      );

                      setResetMessage("");
                    }}
                  >
                    Done
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}


      {/* SWITCH ACCOUNT MODAL */}

      {showSwitchModal && (

        <div className="profile-modal-overlay">

          <div className="profile-modal">

            <div className="profile-modal-icon">
              ⇄
            </div>


            <h2>
              Switch account?
            </h2>


            <p>
              You will be taken to the login page
              to sign in with another account.
            </p>


            <div className="profile-modal-actions">

              <button
                type="button"
                className="profile-modal-cancel"
                onClick={() =>
                  setShowSwitchModal(false)
                }
              >
                Stay here
              </button>


              <button
                type="button"
                className="profile-modal-primary"
                onClick={handleSwitchAccount}
              >
                Switch account
              </button>

            </div>

          </div>

        </div>

      )}


      {/* LOGOUT MODAL */}

      {showLogoutModal && (

        <div className="profile-modal-overlay">

          <div className="profile-modal">

            <div className="profile-modal-icon">
              ⎋
            </div>


            <h2>
              Logout?
            </h2>


            <p>
              Are you sure you want to logout from
              your BookMySeat account?
            </p>


            <div className="profile-modal-actions">

              <button
                type="button"
                className="profile-modal-cancel"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="profile-modal-danger"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Profile;