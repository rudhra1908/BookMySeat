import { useState } from "react";
import "./HelpSupport.css";

function HelpSupport({
  goHome,
  goReservations,
  goSeats,
  goProfile,
}) {
  const [activeFaq, setActiveFaq] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: "How do I reserve a seat?",
      answer:
        "Go to Find a Seat, select your preferred floor, date and time slot, choose an available seat, and confirm your reservation.",
    },
    {
      question: "Can I cancel my reservation?",
      answer:
        "Yes. Open My Reservations and select the reservation you want to cancel. Once cancelled, the seat will become available again.",
    },
    {
      question: "How can I check my reservation details?",
      answer:
        "You can view all your active and previous reservations from the My Reservations section.",
    },
    {
      question: "What happens if I do not check in?",
      answer:
        "Your reservation may automatically expire if you do not check in within the allowed time mentioned on your reservation pass.",
    },
    {
      question: "Can I book more than one seat?",
      answer:
        "You can create reservations based on seat availability and the booking rules configured by the library.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      alert("Please fill in all the fields.");
      return;
    }

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="help-page">
      <div className="help-bg help-bg-one"></div>
      <div className="help-bg help-bg-two"></div>

      <nav className="help-nav">
        <button
          className="help-brand"
          onClick={goHome}
        >
          <div className="brand-icon">
            B
          </div>

          <div>
            <strong>BookMySeat</strong>

            <small>
              SMART RESERVATION SYSTEM
            </small>
          </div>
        </button>

        <div className="help-nav-actions">
          <button onClick={goReservations}>
            My Reservations
          </button>

          <button
            className="help-profile-btn"
            onClick={goProfile}
          >
            My Profile
          </button>

          <button
            className="help-home-btn"
            onClick={goHome}
          >
            Home
          </button>
        </div>
      </nav>

      <main className="help-container">

        {/* HEADER */}

        <section className="help-header">

          <p className="help-eyebrow">
            HELP CENTER
          </p>

          <h1>
            How can we
            <span> help you?</span>
          </h1>

          <p>
            Find answers to common questions or send
            us a message if you need assistance.
          </p>

          <div className="help-quick-actions">

            <button onClick={goSeats}>
              <span>🪑</span>

              <div>
                <strong>
                  Find a Seat
                </strong>

                <small>
                  Reserve your study space
                </small>
              </div>

              <b>→</b>
            </button>

            <button onClick={goReservations}>
              <span>▣</span>

              <div>
                <strong>
                  My Reservations
                </strong>

                <small>
                  View or cancel bookings
                </small>
              </div>

              <b>→</b>
            </button>

            <button onClick={goProfile}>
              <span>◉</span>

              <div>
                <strong>
                  My Profile
                </strong>

                <small>
                  Manage your account
                </small>
              </div>

              <b>→</b>
            </button>

          </div>

        </section>


        <div className="help-layout">

          {/* LEFT SIDE */}

          <section className="help-faq-section">

            <div className="help-section-title">

              <div>

                <p>
                  FREQUENTLY ASKED QUESTIONS
                </p>

                <h2>
                  Quick answers
                </h2>

              </div>

              <span>
                {faqs.length} FAQs
              </span>

            </div>


            <div className="faq-list">

              {faqs.map((faq, index) => (

                <div
                  className={
                    activeFaq === index
                      ? "faq-item active-faq"
                      : "faq-item"
                  }
                  key={index}
                >

                  <button
                    className="faq-question"
                    onClick={() =>
                      setActiveFaq(
                        activeFaq === index
                          ? null
                          : index
                      )
                    }
                  >

                    <span>
                      {faq.question}
                    </span>

                    <b>
                      {activeFaq === index
                        ? "−"
                        : "+"}
                    </b>

                  </button>


                  {activeFaq === index && (

                    <div className="faq-answer">
                      <p>
                        {faq.answer}
                      </p>
                    </div>

                  )}

                </div>

              ))}

            </div>


            <div className="help-still-need">

              <div className="still-need-icon">
                💬
              </div>

              <div>

                <h3>
                  Still need help?
                </h3>

                <p>
                  Our support team is here to help you
                  with any questions about BookMySeat.
                </p>

              </div>

            </div>

          </section>


          {/* RIGHT SIDE CONTACT FORM */}

          <aside className="contact-support-card">

            <div className="contact-card-header">

              <div className="contact-icon">
                ✉
              </div>

              <div>

                <p>
                  CONTACT SUPPORT
                </p>

                <h2>
                  Send us a message
                </h2>

              </div>

            </div>


            {submitted ? (

              <div className="support-success">

                <div className="support-success-icon">
                  ✓
                </div>

                <h3>
                  Message sent!
                </h3>

                <p>
                  Thank you for contacting us. Our
                  support team will get back to you
                  as soon as possible.
                </p>

                <button
                  onClick={() =>
                    setSubmitted(false)
                  }
                >
                  Send another message
                </button>

              </div>

            ) : (

              <form
                className="support-form"
                onSubmit={handleSubmit}
              >

                <div className="support-field">

                  <label>
                    YOUR NAME
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>


                <div className="support-field">

                  <label>
                    EMAIL ADDRESS
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>


                <div className="support-field">

                  <label>
                    SUBJECT
                  </label>

                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select a topic
                    </option>

                    <option>
                      Seat Reservation
                    </option>

                    <option>
                      Cancellation Issue
                    </option>

                    <option>
                      Account & Profile
                    </option>

                    <option>
                      Technical Problem
                    </option>

                    <option>
                      Other
                    </option>

                  </select>

                </div>


                <div className="support-field">

                  <label>
                    MESSAGE
                  </label>

                  <textarea
                    name="message"
                    placeholder="Describe your issue or question..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>

                </div>


                <button
                  type="submit"
                  className="support-submit-btn"
                >
                  Send message
                  <span>→</span>
                </button>

              </form>

            )}

          </aside>

        </div>


        {/* CONTACT INFORMATION */}

        <section className="support-info-grid">

          <div className="support-info-box">

            <div className="support-info-icon">
              ✉
            </div>

            <div>

              <span>
                EMAIL SUPPORT
              </span>

              <strong>
                support@bookmyseat.com
              </strong>

              <small>
                Response within 24 hours
              </small>

            </div>

          </div>


          <div className="support-info-box">

            <div className="support-info-icon">
              ◷
            </div>

            <div>

              <span>
                SUPPORT HOURS
              </span>

              <strong>
                Monday – Saturday
              </strong>

              <small>
                9:00 AM – 6:00 PM
              </small>

            </div>

          </div>


          <div className="support-info-box">

            <div className="support-info-icon">
              ⚡
            </div>

            <div>

              <span>
                QUICK HELP
              </span>

              <strong>
                Check the FAQs
              </strong>

              <small>
                Most answers are available above
              </small>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default HelpSupport;