import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { api, authConfig, downloadReceipt } from "./api";
import "./style.css";

// SVG Icons
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

function Layout({ children, user, onLogout }) {
  const location = useLocation();
  return (
    <>
      <header>
        <Link to="/" className="brand">
          Ganesh Community
        </Link>
        <nav>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
          <Link to="/events" className={location.pathname === "/events" ? "active" : ""}>Events</Link>
          <Link to="/gallery" className={location.pathname === "/gallery" ? "active" : ""}>Gallery</Link>
          <Link to="/committee" className={location.pathname === "/committee" ? "active" : ""}>Committee</Link>
          <Link to="/transparency" className={location.pathname === "/transparency" ? "active" : ""}>Transparency</Link>
          <Link to="/donate" className={location.pathname === "/donate" ? "active" : ""}>Donate</Link>
          <Link to="/register" className={location.pathname === "/register" ? "active" : ""}>Register</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
                Portal
              </Link>
              <button
                onClick={onLogout}
                className="btn btn-primary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              Login
            </Link>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <div className="footer-content">
          <div className="footer-logo">GANESH COMMUNITY MANAGEMENT</div>
          <p>© 2026 Ganesh Community. Preserving culture and cultivating community transparency.</p>
        </div>
      </footer>
    </>
  );
}

// Countdown timer
// Festival Countdown
function Countdown({ festivalDate, festivalTime = "00:00" }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [status, setStatus] = useState("UPCOMING");

  useEffect(() => {
    if (!festivalDate) return;

    const updateCountdown = () => {
      // Asia/Kolkata = UTC+05:30
      const target = new Date(
        `${festivalDate}T${festivalTime || "00:00"}+05:30`
      );

      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setStatus("UPCOMING");

        setTimeLeft({
          days: Math.floor(
            difference / (1000 * 60 * 60 * 24)
          ),
          hours: Math.floor(
            (difference / (1000 * 60 * 60)) % 24
          ),
          minutes: Math.floor(
            (difference / (1000 * 60)) % 60
          ),
          seconds: Math.floor(
            (difference / 1000) % 60
          ),
        });
      } else {
        setStatus("CELEBRATING");

        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    // Run immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [festivalDate, festivalTime]);

  if (!festivalDate) {
    return (
      <p className="notice notice-info">
        Festival date is currently being finalized by the committee.
      </p>
    );
  }

  return (
    <div>
      {status === "UPCOMING" && (
        <>
          <div className="festival-status-badge">
            Festival Countdown
          </div>

          <div className="countdown-box">
            <div className="countdown-item">
              <div className="num">
                {timeLeft.days}
              </div>
              <div className="label">
                Days
              </div>
            </div>

            <div className="countdown-item">
              <div className="num">
                {timeLeft.hours}
              </div>
              <div className="label">
                Hours
              </div>
            </div>

            <div className="countdown-item">
              <div className="num">
                {timeLeft.minutes}
              </div>
              <div className="label">
                Mins
              </div>
            </div>

            <div className="countdown-item">
              <div className="num">
                {timeLeft.seconds}
              </div>
              <div className="label">
                Secs
              </div>
            </div>
          </div>
        </>
      )}

      {status === "CELEBRATING" && (
        <div
          className="festival-status-badge"
          style={{
            background: "rgba(76, 175, 80, 0.15)",
            color: "#4caf50",
            borderColor: "#4caf50",
          }}
        >
          Festival is currently active! Happy Ganesh Chaturthi!
        </div>
      )}
    </div>
  );
}
// Homepage View
function Home() {
  const [settings, setSettings] = useState(null);
  const [committeeList, setCommitteeList] = useState([]);
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    api.get("/content/settings").then(x => setSettings(x.data)).catch(console.error);
    api.get("/content/committee").then(x => setCommitteeList(x.data.slice(0, 3))).catch(console.error);
    api.get("/finance/summary").then(x => setFinance(x.data)).catch(console.error);
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <p style={{ fontSize: "2rem" }}></p>
        <h1>{settings?.communityName || "Ganesh Community"}</h1>
        <p className="lead">{settings?.description || "Welcome to our Ganesh community portal."}</p>
        <Countdown festivalDate={settings?.festivalDate} />
        <div style={{ marginTop: "24px" }}>
          <Link className="btn btn-primary" to="/donate" style={{ marginRight: "12px" }}>Donate Now</Link>
          <Link className="btn btn-outline" to="/register">Join as Member</Link>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Transparency Desk</h2>
          <p style={{ marginBottom: "20px" }}>Real-time verified details of all financial transactions, including community contributions, expenses, and current balances.</p>
          {finance ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Collections:</span>
                <strong style={{ color: "var(--accent-gold)" }}>₹{finance.totalReceived.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Expenses:</span>
                <strong style={{ color: "var(--color-error)" }}>₹{finance.expenses.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                <span>Net Reserve:</span>
                <strong style={{ color: "var(--color-success)" }}>₹{finance.remaining.toLocaleString()}</strong>
              </div>
            </div>
          ) : (
            <p>Loading records...</p>
          )}
          <Link to="/transparency" className="btn btn-outline" style={{ marginTop: "20px", width: "100%" }}>View Ledgers</Link>
        </div>

        <div className="card">
          <h2>Committee Members</h2>
          <p style={{ marginBottom: "20px" }}>Our organizing team responsible for organizing the festival and coordinating community activities.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {committeeList.map(m => (
              <div key={m._id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.02)", padding: "10px", borderRadius: "6px" }}>
                <strong>{m.name}</strong>
                <span style={{ color: "var(--accent-gold)" }}>{m.position}</span>
              </div>
            ))}
          </div>
          <Link to="/committee" className="btn btn-outline" style={{ marginTop: "20px", width: "100%" }}>Full Directory</Link>
        </div>

        <div className="card">
          <h2>Contact Us</h2>
          <p style={{ marginBottom: "16px" }}>Reach out directly to the festival committee for queries or manual receipt verifications.</p>
          {settings ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
              <div>{settings.phone || "Not specified"}</div>
              <div>✉️ {settings.email || "Not specified"}</div>
              <div>{settings.address || "Not specified"}</div>
            </div>
          ) : (
            <p>Loading contact details...</p>
          )}
          <Link to="/committee" className="btn btn-outline" style={{ marginTop: "20px", width: "100%" }}>Message Board</Link>
        </div>
      </section>
    </div>
  );
}

// Events View
function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/content/events")
      .then(x => {
        setEvents(x.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1 style={{ marginBottom: "10px" }}>Community Events</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Stay updated with festival programs, pujas, and distributions.</p>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p className="notice notice-info">No events scheduled at the moment.</p>
      ) : (
        <div className="grid">
          {events.map(ev => (
            <div key={ev._id} className="card">
              <span className={`badge ${ev.status === "UPCOMING" ? "badge-pending" : "badge-success"}`} style={{ marginBottom: "12px" }}>
                {ev.status}
              </span>
              <h2>{ev.title}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.9rem", color: "var(--text-muted)", margin: "12px 0" }}>
                <div> {ev.date ? new Date(ev.date).toLocaleDateString() : "TBD"}</div>
                <div> {ev.time || "TBD"}</div>
                <div>: {ev.location || "TBD"}</div>
              </div>
              <p>{ev.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Gallery View
function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/content/gallery")
      .then(x => {
        setItems(x.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1 style={{ marginBottom: "10px" }}>Celebration Gallery</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Glimpses of past celebrations and community events.</p>

      {loading ? (
        <p>Loading gallery...</p>
      ) : items.length === 0 ? (
        <p className="notice notice-info">No pictures in the gallery yet.</p>
      ) : (
        <div className="gallery-grid">
          {items.map(item => (
            <div key={item._id} className="gallery-card">
              <div className="gallery-img-container">
                <img src={item.imageUrl} alt={item.title} onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1609137144814-9988220054d5?auto=format&fit=crop&w=600&q=80";
                }} />
              </div>
              <div className="gallery-info">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {item.year && <span className="badge badge-success" style={{ marginTop: "8px", fontSize: "0.7rem" }}>{item.year}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Committee View & Message Form
function Committee() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.get("/content/committee")
      .then(x => {
        setMembers(x.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setNotice("Thank you for your message. A committee member will get back to you shortly.");
    setContactData({ name: "", email: "", message: "" });
  };

  return (
    <div className="page">
      <h1 style={{ marginBottom: "10px" }}>Festival Committee</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "40px" }}>Meet the members guiding the celebrations.</p>

      {loading ? (
        <p>Loading directory...</p>
      ) : (
        <>
          <div className="grid" style={{ marginBottom: "60px" }}>
            {members.map(m => (
              <div key={m._id} className="card" style={{ textAlign: "center" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>

                <div>
                    <p style={{ color: "var(--accent-saffron)", fontWeight: "600", marginBottom: "8px" }}>
                    {m.position}
                </p>

                    <p>{m.description || "Active community organizer."}</p>

                    <p style={{ borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                    {m.contact}
                </p>
</div>
            ))}
          </div>

          <div className="form-container">
            <h1>Leave a Message</h1>
            {notice && <p className="notice notice-success">{notice}</p>}
            <form onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={e => setContactData({ ...contactData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={e => setContactData({ ...contactData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="4"
                  value={contactData.message}
                  onChange={e => setContactData({ ...contactData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button className="primary">Send Message</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// Transparency View
function Transparency() {
  const [finance, setFinance] = useState(null);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/finance/summary"),
      api.get("/donations"), // Open endpoint on server? Wait, list in donationController requires auth, let's check
      api.get("/expenses") // Exposes to admin only? Let's check
    ]).then(([f, d, e]) => {
      setFinance(f.data);
      // Wait, if donations list is authenticated, we catch it or handle it
      setDonations(d.data);
      setExpenses(e.data);
      setLoading(false);
    }).catch(err => {
      // In case donations/expenses endpoints return 401 (since they are protected), we fall back to displaying aggregate finance summary
      setLoading(false);
    });

    api.get("/finance/summary").then(x => {
      setFinance(x.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="page">
      <h1 style={{ marginBottom: "10px" }}>Financial Transparency Dashboard</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>All calculations are generated server-side strictly from verified transactions.</p>

      {loading ? (
        <p>Loading financial ledgers...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="label">Total Collections</span>
              <span className="val">₹{finance?.totalReceived.toLocaleString() || 0}</span>
            </div>
            <div className="stat-card">
              <span className="label">Member Contributions</span>
              <span className="val">₹{finance?.memberContributions.toLocaleString() || 0}</span>
            </div>
            <div className="stat-card">
              <span className="label">General Donations</span>
              <span className="val">₹{finance?.donations.toLocaleString() || 0}</span>
            </div>
            <div className="stat-card">
              <span className="label">Total Expenses</span>
              <span className="val" style={{ color: "var(--color-error)" }}>₹{finance?.expenses.toLocaleString() || 0}</span>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "40px" }}>
            <h2>Treasury Status</h2>
            <p style={{ marginBottom: "12px" }}>Reserve funds available for organizing activities.</p>
            <div className="progress-container">
              <div className="progress-labels">
                <span>Net Reserve: ₹{finance?.remaining.toLocaleString()}</span>
                <span>Expenses: ₹{finance?.expenses.toLocaleString()}</span>
              </div>
              <div className="progress-bar-outer">
                <div
                  className="progress-bar-inner"
                  style={{
                    width: `${finance?.totalReceived > 0 ? (finance.remaining / finance.totalReceived) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Donation View
function Donate() {
  const [d, setD] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: ""
  });

  const [m, setM] = useState("");
  const [success, setSuccess] = useState(false);
  const [id, setId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /*
   * STEP 1
   *
   * Create donation request.
   *
   * Backend creates:
   * PENDING
   */
  async function go(e) {
    e.preventDefault();

    if (!d.donorName.trim()) {
      setM("Please enter donor name.");
      return;
    }

    if (!d.email.trim()) {
      setM("Please enter email address.");
      return;
    }

    if (!d.phone.trim()) {
      setM("Please enter phone number.");
      return;
    }

    if (!d.amount || Number(d.amount) < 10) {
      setM(
        "Please enter a donation amount of at least ₹10."
      );
      return;
    }

    setLoading(true);
    setM("");

    try {
      const r = await api.post("/donations", {
        donorName: d.donorName.trim(),
        email: d.email.trim(),
        phone: d.phone.trim(),
        amount: Number(d.amount)
      });

      setId(r.data.donation._id);

      setM(
        "Donation request created. Please complete the payment using the official UPI QR code."
      );
    } catch (err) {
      setM(
        err.response?.data?.message ||
        "Failed to create donation request."
      );
    } finally {
      setLoading(false);
    }
  }


  /*
   * STEP 2
   *
   * Donor clicks:
   * "I Have Completed Payment"
   *
   * IMPORTANT:
   * This does NOT approve the donation.
   *
   * Backend:
   * PENDING → PAYMENT_SUBMITTED
   */
  async function confirmPayment() {
    if (!id) {
      setM("Donation request not found.");
      return;
    }

    setLoading(true);
    setM("");

    try {
      const r = await api.post(
        `/donations/${id}/submit-payment`
      );

      setSubmitted(true);

      setM(
        r.data.message ||
        "Payment submitted. Waiting for admin verification."
      );
    } catch (err) {
      setM(
        err.response?.data?.message ||
        "Failed to submit payment."
      );
    } finally {
      setLoading(false);
    }
  }


  /*
   * Receipt download.
   */
  const handleDownload = async () => {
    if (!receipt) return;

    try {
      await downloadReceipt(
        receipt._id,
        receipt.receiptNumber
      );
    } catch (err) {
      alert(err.message);
    }
  };


  /*
   * Reset everything.
   */
  const resetDonation = () => {
    setSuccess(false);
    setSubmitted(false);
    setId("");
    setReceipt(null);
    setM("");

    setD({
      donorName: "",
      email: "",
      phone: "",
      amount: ""
    });
  };


  return (
    <div className="page">
      <div className="form-container">

        <h1>Donations Desk</h1>

        {m && (
          <p
            className={`notice ${success
              ? "notice-success"
              : "notice-info"
              }`}
          >
            {m}
          </p>
        )}


        {/* ------------------------------------------------ */}
        {/* STEP 3 — SUCCESS                                */}
        {/* ------------------------------------------------ */}

        {success ? (
          <div
            style={{
              textAlign: "center",
              marginTop: "20px"
            }}
          >
            <p
              style={{
                color: "var(--accent-gold)",
                fontWeight: "700",
                marginBottom: "20px"
              }}
            >
              Thank you for your generous contribution
              to the community!
            </p>

            {receipt && (
              <button
                className="secondary"
                onClick={handleDownload}
              >
                <IconDownload />
                Download Receipt PDF
              </button>
            )}

            <button
              className="outline"
              style={{
                marginTop: "12px",
                width: "100%"
              }}
              onClick={resetDonation}
            >
              Make Another Donation
            </button>
          </div>
        ) : submitted ? (

          /* ------------------------------------------------ */
          /* PAYMENT SUBMITTED                                */
          /* ------------------------------------------------ */

          <div
            style={{
              textAlign: "center",
              marginTop: "30px"
            }}
          >
            <h2>
              Payment Submitted
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                marginTop: "15px",
                lineHeight: 1.7
              }}
            >
              Your payment has been submitted for
              verification.
              <br />
              An administrator will verify the UPI
              transaction before approving your donation.
            </p>

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "10px",
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid var(--border-color)"
              }}
            >
              <strong>
                Status: PAYMENT SUBMITTED
              </strong>
            </div>

            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginTop: "15px"
              }}
            >
              A receipt will become available only
              after the administrator verifies your
              payment.
            </p>

            <button
              className="outline"
              style={{
                marginTop: "20px",
                width: "100%"
              }}
              onClick={resetDonation}
            >
              Close
            </button>
          </div>

        ) : !id ? (

          /* ------------------------------------------------ */
          /* STEP 1 — DONATION FORM                           */
          /* ------------------------------------------------ */

          <form onSubmit={go}>

            <div className="form-group">
              <label>Donor Name</label>

              <input
                type="text"
                value={d.donorName}
                onChange={(e) =>
                  setD({
                    ...d,
                    donorName: e.target.value
                  })
                }
                required
              />
            </div>


            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                value={d.email}
                onChange={(e) =>
                  setD({
                    ...d,
                    email: e.target.value
                  })
                }
                required
              />
            </div>


            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                value={d.phone}
                onChange={(e) =>
                  setD({
                    ...d,
                    phone: e.target.value
                  })
                }
                required
              />
            </div>


            <div className="form-group">
              <label>Donation Amount (₹)</label>

              <input
                type="number"
                min="10"
                value={d.amount}
                onChange={(e) =>
                  setD({
                    ...d,
                    amount: e.target.value
                  })
                }
                required
              />
            </div>


            <button
              className="primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Donation..."
                : "Continue to Payment"}
            </button>

          </form>

        ) : (

          /* ------------------------------------------------ */
          /* STEP 2 — UPI PAYMENT                            */
          /* ------------------------------------------------ */

          <div
            style={{
              textAlign: "center",
              marginTop: "20px"
            }}
          >

            <h2>
              Complete Your Donation
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "20px"
              }}
            >
              Scan the official UPI QR code using
              Google Pay, PhonePe, Paytm or your
              bank's UPI app.
            </p>


            <div
              style={{
                padding: "12px 20px",
                marginBottom: "20px",
                borderRadius: "8px",
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid var(--border-color)"
              }}
            >
              <strong>
                Donation Amount: ₹
                {Number(
                  d.amount
                ).toLocaleString("en-IN")}
              </strong>
            </div>


            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: "16px",
                  borderRadius: "12px",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.25)"
                }}
              >
                <img
                  src="/bank-qr.png"
                  alt="Official UPI QR Code"
                  style={{
                    display: "block",
                    width: "280px",
                    height: "280px",
                    objectFit: "contain"
                  }}
                />
              </div>
            </div>


            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "20px"
              }}
            >
              Complete the actual payment first.
              After payment is completed, click
              "I Have Completed Payment".
            </p>


            <button
              className="secondary"
              onClick={confirmPayment}
              disabled={loading}
              style={{
                width: "100%",
                marginBottom: "12px"
              }}
            >
              {loading
                ? "Submitting..."
                : "I Have Completed Payment"}
            </button>


            <button
              className="outline"
              onClick={resetDonation}
              disabled={loading}
              style={{
                width: "100%"
              }}
            >
              Cancel Payment
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

// Member Registration View
function Register() {
  const [d, setD] = useState({ name: "", email: "", phone: "", address: "", occupation: "" });
  const [m, setM] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function go(e) {
    e.preventDefault();
    setLoading(true);
    setM("");
    try {
      const r = await api.post("/member-applications", d);
      setM(r.data.message);
      setSuccess(true);
      setD({ name: "", email: "", phone: "", address: "", occupation: "" });
    } catch (err) {
      setM(err.response?.data?.message || "Failed to submit application.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="form-container">
        <h1>Join the Community</h1>
        {m && (
          <p className={`notice ${success ? "notice-success" : "notice-error"}`}>
            {m}
          </p>
        )}

        <form onSubmit={go}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={d.name}
              onChange={e => setD({ ...d, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={d.email}
              onChange={e => setD({ ...d, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={d.phone}
              onChange={e => setD({ ...d, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Residential Address</label>
            <input
              type="text"
              value={d.address}
              onChange={e => setD({ ...d, address: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Occupation</label>
            <input
              type="text"
              value={d.occupation}
              onChange={e => setD({ ...d, occupation: e.target.value })}
              required
            />
          </div>
          <button className="primary" disabled={loading}>
            {loading ? "Submitting application..." : "Submit Membership Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Login View
function Login({ onLoginSuccess }) {
  const [d, setD] = useState({ email: "", password: "" });
  const [m, setM] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function go(e) {
    e.preventDefault();
    setLoading(true);
    setM("");
    try {
      const r = await api.post("/auth/login", d);
      localStorage.setItem("token", r.data.token);
      onLoginSuccess(r.data.user);
      navigate("/dashboard");
    } catch (err) {
      setM(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="form-container">
        <h1>Portal Login</h1>
        {m && <p className="notice notice-error">{m}</p>}
        <form onSubmit={go}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={d.email}
              onChange={e => setD({ ...d, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={d.password}
              onChange={e => setD({ ...d, password: e.target.value })}
              required
            />
          </div>
          <button className="primary" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard router
function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return <div className="page"><p>Loading dashboard portal...</p></div>;

  const isAdmin = ["PRESIDENT", "VICE_PRESIDENT"].includes(user.role);

  return (
    <div className="page" style={{ maxWidth: "100%", width: "100%", margin: "0", padding: "0" }}>
      {isAdmin ? (
        <AdminPortal user={user} onLogout={onLogout} />
      ) : (
        <MemberPortal user={user} onLogout={onLogout} />
      )}
    </div>
  );
}

// Member Portal Component
function MemberPortal({ user }) {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [cashRef, setCashRef] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState({ phone: "", address: "", occupation: "" });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "" });
  const [secMsg, setSecMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        api.get("/payments", authConfig()),
        api.get("/members/me", authConfig())
      ]);
      setPayments(pRes.data);
      setData(mRes.data);
      setProfile({
        phone: mRes.data.member.phone || "",
        address: mRes.data.member.address || "",
        occupation: mRes.data.member.occupation || ""
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePay = async (method) => {
    if (!amount || Number(amount) < 1) {
      setMsg("Please enter a valid contribution amount.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const r = await api.post(
        "/payments",
        {
          amount: Number(amount),
          paymentMethod: method,
          referenceNumber: method === "CASH" ? cashRef : undefined
        },
        authConfig()
      );

      if (method === "UPI") {
        await api.post(`/payments/${r.data.payment._id}/demo-success`, {}, authConfig());
        setMsg("Simulated UPI payment verified. Receipt generated successfully.");
        setAmount("");
      } else {
        setMsg("Cash reference submitted. Approval remains PENDING until verified by an administrator.");
        setAmount("");
        setCashRef("");
      }
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Payment transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (receiptId, receiptNumber) => {
    try {
      await downloadReceipt(receiptId, receiptNumber);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.patch("/members/profile", profile, authConfig());
      setMsg("Profile details updated successfully.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecMsg("");
    try {
      await api.post("/auth/change-password", security, authConfig());
      setSecMsg("Password changed successfully.");
      setSecurity({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setSecMsg(err.response?.data?.message || "Password update failed.");
    }
  };

  if (!data) return <p style={{ padding: "40px" }}>Loading profile details...</p>;

  return (
    <div style={{ padding: "40px 5%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>Welcome, {data.member.name}</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage contributions, payments, and receipts.</p>
        </div>
        <span className="badge badge-success">ACTIVE MEMBER</span>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile settings</button>
        <button className={`tab-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>Security</button>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid" style={{ alignItems: "start" }}>
          <div>
            <div className="member-id-card">
              <div className="member-card-header">
                <span className="member-card-logo">GANESH COMMUNITY</span>
                <span className="badge badge-success">MEMBER</span>
              </div>
              <div className="member-card-body">
                <h3>{data.member.name}</h3>
                <div className="id-num">{data.member.memberId}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Email: {data.member.email}<br />
                  Phone: {data.member.phone}
                </div>
              </div>
              <div className="member-card-footer">
                <div>
                  Required Contribution
                  <strong>₹{data.member.contributionAmount.toLocaleString()}</strong>
                </div>
                <div>
                  Paid
                  <strong>₹{data.paid.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Required Contribution Progress</h2>
              <div className="progress-container">
                <div className="progress-labels">
                  <span>Paid: ₹{data.paid}</span>
                  <span>Remaining: ₹{data.remaining}</span>
                </div>
                <div className="progress-bar-outer">
                  <div
                    className="progress-bar-inner"
                    style={{
                      width: `${data.member.contributionAmount > 0 ? (data.paid / data.member.contributionAmount) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="card">
              <h2>Submit Contribution Payment</h2>
              {msg && <p className="notice notice-info" style={{ marginTop: "12px" }}>{msg}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount to pay"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <button className="primary" onClick={() => handlePay("UPI")} disabled={loading}>
                    Pay UPI (Demo)
                  </button>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                      type="text"
                      value={cashRef}
                      onChange={e => setCashRef(e.target.value)}
                      placeholder="Cash receipt/ref ref no"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "8px", color: "var(--text-main)", font: "inherit", fontSize: "0.85rem" }}
                    />
                    <button className="secondary" onClick={() => handlePay("CASH")} disabled={loading}>
                      Submit Cash reference
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Payment & Receipt Logs</h2>
              {payments.length === 0 ? (
                <p style={{ marginTop: "12px" }}>No past payments recorded yet.</p>
              ) : (
                <div className="table-wrapper" style={{ marginTop: "16px" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Reference</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p._id}>
                          <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td><span className="badge badge-success">{p.paymentMethod}</span></td>
                          <td>₹{p.amount}</td>
                          <td>
                            <span className={`badge ${p.status === "SUCCESS" ? "badge-success" : p.status === "PENDING" ? "badge-pending" : "badge-error"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>{p.transactionId || p.referenceNumber || "-"}</td>
                          <td>
                            {p.status === "SUCCESS" ? (
                              <button
                                className="btn-outline"
                                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                onClick={() => handleDownload(p.receiptId || p._id, `Receipt-${p.transactionId || p._id}`)}
                              >
                                <IconDownload /> Receipt
                              </button>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Pending verification</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="form-container" style={{ margin: "20px auto" }}>
          <h1>Update Profile Details</h1>
          {msg && <p className="notice notice-info">{msg}</p>}
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Residential Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <input
                type="text"
                value={profile.occupation}
                onChange={e => setProfile({ ...profile, occupation: e.target.value })}
                required
              />
            </div>
            <button className="primary">Save Profile</button>
          </form>
        </div>
      )}

      {activeTab === "security" && (
        <div className="form-container" style={{ margin: "20px auto" }}>
          <h1>Change Password</h1>
          {secMsg && <p className={`notice ${secMsg.includes("successfully") ? "notice-success" : "notice-error"}`}>{secMsg}</p>}
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={security.currentPassword}
                onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={security.newPassword}
                onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                required
              />
            </div>
            <button className="primary">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}

// Admin Portal Component
function AdminPortal({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [apps, setApps] = useState([]);
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ communityName: "", description: "", festivalDate: "", phone: "", email: "", address: "" });
  const [finance, setFinance] = useState(null);

  // Form states for CRUD
  const [eventData, setEventData] = useState({ title: "", description: "", date: "", time: "", location: "", status: "UPCOMING" });
  const [eventsList, setEventsList] = useState([]);
  const [galleryData, setGalleryData] = useState({ imageUrl: "", title: "", description: "", year: new Date().getFullYear() });
  const [galleryList, setGalleryList] = useState([]);
  const [committeeData, setCommitteeData] = useState({ name: "", position: "", photoUrl: "", description: "", contact: "" });
  const [committeeList, setCommitteeList] = useState([]);
  const [expenseData, setExpenseData] = useState({ title: "", category: "", amount: "", vendor: "", paymentMethod: "CASH", referenceNumber: "" });

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");

  const loadData = async () => {
    const config = authConfig();
    try {
      const [
        appsRes, paymentsRes, membersRes, summaryRes,
        donationsRes, receiptsRes, expensesRes, settingsRes,
        logsRes, eventsRes, galleryRes, committeeRes
      ] = await Promise.all([
        api.get("/member-applications", config),
        api.get("/payments", config),
        api.get("/members", config),
        api.get("/finance/admin-summary", config),
        api.get("/donations", config),
        api.get("/receipts", config),
        api.get("/expenses", config),
        api.get("/content/settings"),
        api.get("/audit-logs", config),
        api.get("/content/events"),
        api.get("/content/gallery"),
        api.get("/content/committee")
      ]);

      setApps(appsRes.data);
      setPayments(paymentsRes.data);
      setMembers(membersRes.data);
      setFinance(summaryRes.data);
      setDonations(donationsRes.data);
      setReceipts(receiptsRes.data);
      setExpenses(expensesRes.data);
      setLogs(logsRes.data);
      setEventsList(eventsRes.data);
      setGalleryList(galleryRes.data);
      setCommitteeList(committeeRes.data);

      if (settingsRes.data) {
        setSettings({
          communityName: settingsRes.data.communityName || "",
          description: settingsRes.data.description || "",
          festivalDate: settingsRes.data.festivalDate ? settingsRes.data.festivalDate.split("T")[0] : "",
          phone: settingsRes.data.phone || "",
          email: settingsRes.data.email || "",
          address: settingsRes.data.address || ""
        });
      }
    } catch (e) {
      console.error("Failed to load admin dashboard tables", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleApproveApp = async (id) => {
    try {
      await api.patch(`/member-applications/${id}/approve`, {}, authConfig());
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed.");
    }
  };

  const handleRejectApp = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/member-applications/${selectedAppId}/reject`, { reason: rejectReason }, authConfig());
      setShowRejectModal(false);
      setRejectReason("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed.");
    }
  };

  const handleVerifyCash = async (id) => {
    try {
      await api.patch(`/payments/${id}/approve-cash`, {}, authConfig());
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Cash verification failed.");
    }
  };

  const handleUpdateContribution = async (id, amount) => {
    if (!amount || amount < 0) return;
    try {
      await api.patch(`/members/${id}/contribution`, { amount: Number(amount) }, authConfig());
      loadData();
    } catch (err) {
      alert("Failed to update member contribution required.");
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", expenseData, authConfig());
      setExpenseData({ title: "", category: "", amount: "", vendor: "", paymentMethod: "CASH", referenceNumber: "" });
      loadData();
    } catch (err) {
      alert("Failed to create expense entry.");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`, authConfig());
      loadData();
    } catch (err) {
      alert("Failed to delete expense entry.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/content/events", eventData, authConfig());
      setEventData({ title: "", description: "", date: "", time: "", location: "", status: "UPCOMING" });
      loadData();
    } catch (err) {
      alert("Failed to create community event.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/content/events/${id}`, authConfig());
      loadData();
    } catch (err) {
      alert("Failed to delete event.");
    }
  };

  const handleCreateGallery = async (e) => {
    e.preventDefault();
    try {
      await api.post("/content/gallery", galleryData, authConfig());
      setGalleryData({ imageUrl: "", title: "", description: "", year: new Date().getFullYear() });
      loadData();
    } catch (err) {
      alert("Failed to add gallery image.");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      await api.delete(`/content/gallery/${id}`, authConfig());
      loadData();
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    try {
      await api.post("/content/committee", committeeData, authConfig());
      setCommitteeData({ name: "", position: "", photoUrl: "", description: "", contact: "" });
      loadData();
    } catch (err) {
      alert("Failed to register committee member.");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/content/settings", settings, authConfig());
      alert("Portal configurations saved successfully.");
      loadData();
    } catch (err) {
      alert("Failed to save portal settings.");
    }
  };

  const handleDownload = async (receiptId, receiptNumber) => {
    try {
      await downloadReceipt(receiptId, receiptNumber);
    } catch (err) {
      alert(err.message);
    }
  };

  const stats = [
    { label: "Active Members", val: members.length },
    { label: "Pending Apps", val: apps.filter(x => x.status === "PENDING").length },
    { label: "Cash Approvals Due", val: payments.filter(x => x.paymentMethod === "CASH" && x.status === "PENDING").length },
    { label: "Total Reserve Fund", val: `₹${finance?.remaining.toLocaleString() || 0}` }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <ul className="admin-sidebar-menu">
          <li className={`admin-sidebar-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</li>
          <li className={`admin-sidebar-item ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>Members Management</li>
          <li className={`admin-sidebar-item ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>Pending Registrations</li>
          <li className={`admin-sidebar-item ${activeTab === "cash" ? "active" : ""}`} onClick={() => setActiveTab("cash")}>Verify Cash Payments</li>
          <li className={`admin-sidebar-item ${activeTab === "donations" ? "active" : ""}`} onClick={() => setActiveTab("donations")}>Donations Registry</li>
          <li
            className={`admin-sidebar-item ${activeTab === "donationVerification" ? "active" : ""}`}
            onClick={() => setActiveTab("donationVerification")}
          >
            Donation Verification
          </li>
          <li className={`admin-sidebar-item ${activeTab === "receipts" ? "active" : ""}`} onClick={() => setActiveTab("receipts")}>Receipt Audit</li>
          <li className={`admin-sidebar-item ${activeTab === "expenses" ? "active" : ""}`} onClick={() => setActiveTab("expenses")}>Expenses Desk</li>
          <li className={`admin-sidebar-item ${activeTab === "content" ? "active" : ""}`} onClick={() => setActiveTab("content")}>Content Control</li>
          <li className={`admin-sidebar-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>⚙️ Portal Settings</li>
          <li className={`admin-sidebar-item ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>Security Audit Trail</li>
        </ul>
      </aside>

      <section className="admin-content">
        <div className="admin-header">
          <div className="admin-title">
            <h1>Admin Panel</h1>
            <p>Welcome, {user.name} ({user.role})</p>
          </div>
          <span className="badge badge-success">Verified Admin Access</span>
        </div>

        {activeTab === "overview" && (
          <div>
            <div className="stats-grid">
              {stats.map((s, idx) => (
                <div key={idx} className="stat-card">
                  <span className="label">{s.label}</span>
                  <span className="val">{s.val}</span>
                </div>
              ))}
            </div>

            <div className="grid">
              <div className="card">
                <h2>Financial Status Summary</h2>
                {finance && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Total Collections (Success only):</span>
                      <strong>₹{finance.totalReceived.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Member Contributions:</span>
                      <strong>₹{finance.memberContributions.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Public Donations:</span>
                      <strong>₹{finance.donations.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Expenses Logged:</span>
                      <strong>₹{finance.expenses.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <span>Remaining Balance:</span>
                      <strong style={{ color: "var(--color-success)" }}>₹{finance.remaining.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <h2>Pending Action Quick Summary</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <div>cations pending approval: <strong>{apps.filter(x => x.status === "PENDING").length}</strong></div>
                  <div>payments waiting verification: <strong>{payments.filter(x => x.paymentMethod === "CASH" && x.status === "PENDING").length}</strong></div>
                  <div>uled festival events: <strong>{eventsList.length}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="card">
            <h2>Active Members Directory</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Required Contribution</th>
                    <th>Set Required Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m._id}>
                      <td style={{ fontFamily: "monospace" }}>{m.memberId}</td>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>₹{m.contributionAmount}</td>
                      <td>
                        <input
                          type="number"
                          placeholder="Amount"
                          defaultValue={m.contributionAmount}
                          onBlur={(e) => handleUpdateContribution(m._id, e.target.value)}
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", padding: "6px", borderRadius: "6px", color: "var(--text-main)", width: "100px", font: "inherit", fontSize: "0.85rem" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="card">
            <h2>Membership Applications Pending Approval</h2>
            {apps.filter(x => x.status === "PENDING").length === 0 ? (
              <p style={{ marginTop: "16px" }}>No pending member applications found.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Occupation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.filter(x => x.status === "PENDING").map(a => (
                      <tr key={a._id}>
                        <td>{a.name}</td>
                        <td>{a.email}</td>
                        <td>{a.phone}</td>
                        <td>{a.address}</td>
                        <td>{a.occupation}</td>
                        <td>
                          <button className="primary" onClick={() => handleApproveApp(a._id)} style={{ padding: "6px 12px", fontSize: "0.8rem", marginRight: "8px" }}>
                            Approve
                          </button>
                          <button className="danger" onClick={() => { setSelectedAppId(a._id); setShowRejectModal(true); }} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showRejectModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button className="modal-close" onClick={() => setShowRejectModal(false)}>Ã—</button>
                  <h2 style={{ marginBottom: "20px" }}>Reject Application</h2>
                  <form onSubmit={handleRejectApp}>
                    <div className="form-group">
                      <label>Rejection Reason</label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        required
                        placeholder="Provide reason for rejection"
                      />
                    </div>
                    <button className="danger">Reject Permanently</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "cash" && (
          <div className="card">
            <h2>Cash Payments Verification Desk</h2>
            {payments.filter(x => x.paymentMethod === "CASH" && x.status === "PENDING").length === 0 ? (
              <p style={{ marginTop: "16px" }}>No cash payments pending verification.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Amount</th>
                      <th>Ref Number</th>
                      <th>Date Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.filter(x => x.paymentMethod === "CASH" && x.status === "PENDING").map(p => (
                      <tr key={p._id}>
                        <td>{p.memberId?.name || "Unknown Member"} ({p.memberId?.memberId || "-"})</td>
                        <td>₹{p.amount}</td>
                        <td style={{ color: "var(--accent-saffron)" }}>{p.referenceNumber || "No reference provided"}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="primary" onClick={() => handleVerifyCash(p._id)} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            Approve & Generate Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "donations" && (
          <div className="card">
            <h2>General public Donations Registries</h2>
            {donations.length === 0 ? (
              <p style={{ marginTop: "16px" }}>No donations logged yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d._id}>
                        <td>{d.donorName}</td>
                        <td>{d.email}</td>
                        <td>{d.phone}</td>
                        <td>₹{d.amount}</td>
                        <td>
                          <span className={`badge ${d.status === "SUCCESS" ? "badge-success" : "badge-pending"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>{d.transactionId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "donationVerification" && (
          <AdminDonations />
        )}

        {activeTab === "receipts" && (
          <div className="card">
            <h2>Generated receipts Ledger</h2>
            {receipts.length === 0 ? (
              <p style={{ marginTop: "16px" }}>No receipts found.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Receipt Number</th>
                      <th>Type</th>
                      <th>Recipient details</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map(r => (
                      <tr key={r._id}>
                        <td style={{ fontFamily: "monospace" }}>{r.receiptNumber}</td>
                        <td><span className="badge badge-success">{r.type}</span></td>
                        <td>
                          {r.type === "MEMBER_PAYMENT"
                            ? `${r.memberId?.name || "Member"} (${r.memberId?.memberId || "-"})`
                            : `${r.donationId?.donorName || "Donor"} (Donation)`}
                        </td>
                        <td>₹{r.amount}</td>
                        <td>{r.paymentMethod}</td>
                        <td>
                          <button className="btn-outline" style={{ padding: "4px 8px", fontSize: "0.8rem" }} onClick={() => handleDownload(r._id, r.receiptNumber)}>
                            <IconDownload /> Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "expenses" && (
          <div>
            <div className="form-container" style={{ margin: "0 0 30px 0", maxWidth: "100%" }}>
              <h1>Log New Expense</h1>
              <form onSubmit={handleCreateExpense}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={expenseData.title}
                      onChange={e => setExpenseData({ ...expenseData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Tent, Puja, Prasad"
                      value={expenseData.category}
                      onChange={e => setExpenseData({ ...expenseData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={expenseData.amount}
                      onChange={e => setExpenseData({ ...expenseData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Vendor</label>
                    <input
                      type="text"
                      value={expenseData.vendor}
                      onChange={e => setExpenseData({ ...expenseData, vendor: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={expenseData.paymentMethod}
                      onChange={e => setExpenseData({ ...expenseData, paymentMethod: e.target.value })}
                    >
                      <option value="CASH">CASH</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Reference Number</label>
                    <input
                      type="text"
                      value={expenseData.referenceNumber}
                      onChange={e => setExpenseData({ ...expenseData, referenceNumber: e.target.value })}
                    />
                  </div>
                </div>
                <button className="primary">Add Expense Entry</button>
              </form>
            </div>

            <div className="card">
              <h2>Expense Ledger</h2>
              {expenses.length === 0 ? (
                <p style={{ marginTop: "16px" }}>No expenses logged yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Vendor</th>
                        <th>Reference</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e._id}>
                          <td>{new Date(e.date).toLocaleDateString()}</td>
                          <td>{e.title}</td>
                          <td><span className="badge badge-pending">{e.category}</span></td>
                          <td>₹{e.amount}</td>
                          <td>{e.vendor}</td>
                          <td>{e.referenceNumber || "-"}</td>
                          <td>
                            <button className="danger" onClick={() => handleDeleteExpense(e._id)} style={{ padding: "4px 8px", fontSize: "0.8rem" }}>
                              <IconTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <div className="card">
              <h2>Festival Events Manager</h2>
              <form onSubmit={handleCreateEvent} style={{ margin: "20px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group">
                    <label>Event Title</label>
                    <input type="text" value={eventData.title} onChange={e => setEventData({ ...eventData, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={eventData.date} onChange={e => setEventData({ ...eventData, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="text" placeholder="e.g. 6:00 PM" value={eventData.time} onChange={e => setEventData({ ...eventData, time: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={eventData.location} onChange={e => setEventData({ ...eventData, location: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label>Description</label>
                  <textarea rows="2" value={eventData.description} onChange={e => setEventData({ ...eventData, description: e.target.value })} required></textarea>
                </div>
                <button className="primary">Create Event</button>
              </form>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsList.map(ev => (
                      <tr key={ev._id}>
                        <td>{ev.title}</td>
                        <td>{new Date(ev.date).toLocaleDateString()}</td>
                        <td>{ev.location}</td>
                        <td>
                          <button className="danger" onClick={() => handleDeleteEvent(ev._id)} style={{ padding: "4px 8px", fontSize: "0.8rem" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h2>Gallery Images Manager</h2>
              <form onSubmit={handleCreateGallery} style={{ margin: "20px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input type="url" placeholder="https://..." value={galleryData.imageUrl} onChange={e => setGalleryData({ ...galleryData, imageUrl: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={galleryData.title} onChange={e => setGalleryData({ ...galleryData, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input type="number" value={galleryData.year} onChange={e => setGalleryData({ ...galleryData, year: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input type="text" value={galleryData.description} onChange={e => setGalleryData({ ...galleryData, description: e.target.value })} />
                  </div>
                </div>
                <button className="primary">Add Photo</button>
              </form>

              <div className="gallery-grid" style={{ marginTop: "20px" }}>
                {galleryList.map(item => (
                  <div key={item._id} className="gallery-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
                      <div>
                        <h4 style={{ fontSize: "0.9rem" }}>{item.title}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.year}</span>
                      </div>
                    </div>
                    <button className="danger" onClick={() => handleDeleteGallery(item._id)} style={{ padding: "4px 8px", fontSize: "0.8rem" }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Committee Manager</h2>
              <form onSubmit={handleCreateCommittee} style={{ margin: "20px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={committeeData.name} onChange={e => setCommitteeData({ ...committeeData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input type="text" placeholder="e.g. Treasurer" value={committeeData.position} onChange={e => setCommitteeData({ ...committeeData, position: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input type="text" value={committeeData.contact} onChange={e => setCommitteeData({ ...committeeData, contact: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Bio/Description</label>
                    <input type="text" value={committeeData.description} onChange={e => setCommitteeData({ ...committeeData, description: e.target.value })} />
                  </div>
                </div>
                <button className="primary">Add Member</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Community configurations</h2>
            <form onSubmit={handleSaveSettings} style={{ marginTop: "20px" }}>
              <div className="form-group">
                <label>Community Name</label>
                <input
                  type="text"
                  value={settings.communityName}
                  onChange={e => setSettings({ ...settings, communityName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Welcome Description</label>
                <textarea
                  rows="3"
                  value={settings.description}
                  onChange={e => setSettings({ ...settings, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Ganesh Festival Date</label>
                <input
                  type="date"
                  value={settings.festivalDate}
                  onChange={e => setSettings({ ...settings, festivalDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
              <button className="primary">Save Configuration</button>
            </form>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="card">
            <h2>Administrative Audit logs</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>{log.userId?.name || "System"} ({log.userId?.role || "-"})</td>
                      <td><span className="badge badge-success">{log.action}</span></td>
                      <td>{log.entity} ({log.entityId})</td>
                      <td style={{ color: "var(--accent-gold)" }}>{log.newValue || log.oldValue || "No description"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore session
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me", authConfig())
        .then(r => {
          setUser(r.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const handleLoginSuccess = (usr) => {
    setUser(usr);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
      </Routes>
    </Layout>
  );
}

//
function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [transactionIds, setTransactionIds] =
    useState({});

  const [rejectReasons, setRejectReasons] =
    useState({});


  async function loadDonations() {
    setLoading(true);

    try {
      const r = await api.get(
        "/donations",
        authConfig()
      );

      setDonations(r.data);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Failed to load donations."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDonations();
  }, []);


  function updateTransactionId(id, value) {
    setTransactionIds((prev) => ({
      ...prev,
      [id]: value
    }));
  }


  function updateRejectReason(id, value) {
    setRejectReasons((prev) => ({
      ...prev,
      [id]: value
    }));
  }


  async function approveDonation(donation) {
    const transactionId =
      transactionIds[donation._id]?.trim();

    if (!transactionId) {
      setMessage(
        "Enter the actual UPI transaction/reference ID before approving."
      );
      return;
    }

    if (transactionId.length < 4) {
      setMessage(
        "Please enter a valid transaction/reference ID."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const r = await api.post(
        `/donations/${donation._id}/approve`,
        {
          transactionId
        },
        authConfig()
      );

      setMessage(
        r.data.message ||
        "Donation approved successfully."
      );

      await loadDonations();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Failed to approve donation."
      );
    } finally {
      setLoading(false);
    }
  }


  async function rejectDonation(donation) {
    const reason =
      rejectReasons[donation._id]?.trim();

    if (!reason) {
      setMessage(
        "Please enter a rejection reason."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const r = await api.post(
        `/donations/${donation._id}/reject`,
        {
          reason
        },
        authConfig()
      );

      setMessage(
        r.data.message ||
        "Donation rejected."
      );

      await loadDonations();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Failed to reject donation."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="page">
      <div className="form-container">

        <h1>Donation Verification</h1>

        {message && (
          <p className="notice notice-info">
            {message}
          </p>
        )}

        {loading && (
          <p
            style={{
              color: "var(--text-muted)"
            }}
          >
            Processing...
          </p>
        )}

        {!donations.length ? (
          <p
            style={{
              color: "var(--text-muted)"
            }}
          >
            No donations found.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto"
            }}
          >

            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {donations.map((donation) => (
                  <tr key={donation._id}>

                    <td>
                      {donation.donorName}
                    </td>

                    <td>
                      ₹
                      {Number(
                        donation.amount
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {donation.phone}
                    </td>

                    <td>
                      {donation.email}
                    </td>

                    <td>
                      <strong>
                        {donation.status}
                      </strong>
                    </td>

                    <td>
                      {donation.transactionId ||
                        "-"}
                    </td>

                    <td>

                      {donation.status ===
                        "PAYMENT_SUBMITTED" ? (

                        <div
                          style={{
                            minWidth: "260px"
                          }}
                        >

                          <input
                            type="text"
                            placeholder="Actual UPI transaction ID"
                            value={
                              transactionIds[
                              donation._id
                              ] || ""
                            }
                            onChange={(e) =>
                              updateTransactionId(
                                donation._id,
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              marginBottom: "8px"
                            }}
                          />

                          <button
                            className="primary"
                            onClick={() =>
                              approveDonation(
                                donation
                              )
                            }
                            disabled={loading}
                            style={{
                              width: "100%",
                              marginBottom: "8px"
                            }}
                          >
                            Approve Donation
                          </button>


                          <input
                            type="text"
                            placeholder="Rejection reason"
                            value={
                              rejectReasons[
                              donation._id
                              ] || ""
                            }
                            onChange={(e) =>
                              updateRejectReason(
                                donation._id,
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              marginBottom: "8px"
                            }}
                          />


                          <button
                            className="outline"
                            onClick={() =>
                              rejectDonation(
                                donation
                              )
                            }
                            disabled={loading}
                            style={{
                              width: "100%"
                            }}
                          >
                            Reject Donation
                          </button>

                        </div>

                      ) : donation.status ===
                        "SUCCESS" ? (

                        <span>
                          Approved
                          {donation.receiptId
                            ?.receiptNumber
                            ? ` — ${donation.receiptId.receiptNumber}`
                            : ""}
                        </span>

                      ) : donation.status ===
                        "REJECTED" ? (

                        <span>
                          Rejected
                          {donation.rejectionReason
                            ? ` — ${donation.rejectionReason}`
                            : ""}
                        </span>

                      ) : (

                        <span>
                          Waiting for donor payment
                        </span>

                      )}

                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>
        )}

      </div>
    </div>
  );
}







