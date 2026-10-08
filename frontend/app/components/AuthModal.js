"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Lock, Mail, User, Phone, Sparkles } from "lucide-react";
import "./AuthModal.css";

export default function AuthModal() {
  const {
    authModalOpen,
    authModalTab,
    setAuthModalTab,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setSuccess("Welcome back to Al-Nawab!");
      setTimeout(() => {
        closeAuthModal();
      }, 800);
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      setSuccess("Account created successfully! Welcome to Al-Nawab.");
      setTimeout(() => {
        closeAuthModal();
      }, 800);
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setSuccess("Logged in successfully!");
      setTimeout(() => {
        closeAuthModal();
      }, 800);
    } catch (err) {
      setError(err.message || "Quick login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {authModalTab === "login" ? "Patron Sign In" : "Join the Royal Feast"}
          </h2>
          <button className="auth-modal-close" onClick={closeAuthModal}>
            <X size={20} />
          </button>
        </div>

        <div className="auth-modal-tabs">
          <button
            className={`auth-modal-tab ${authModalTab === "login" ? "active" : ""}`}
            onClick={() => {
              setAuthModalTab("login");
              setError("");
              setSuccess("");
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-modal-tab ${authModalTab === "register" ? "active" : ""}`}
            onClick={() => {
              setAuthModalTab("register");
              setError("");
              setSuccess("");
            }}
          >
            Create Account
          </button>
        </div>

        <div className="auth-modal-body">
          {error && <div className="auth-error-banner">{error}</div>}
          {success && <div className="auth-success-banner">{success}</div>}

          {authModalTab === "login" ? (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="auth-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. customer@alnawab.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginTop: "0.5rem" }}
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>

              <div className="auth-demo-section">
                <p className="auth-demo-label">✨ Instant Demo Sign-In</p>
                <div className="auth-demo-grid">
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => handleQuickLogin("customer@alnawab.com", "Customer@123")}
                  >
                    👤 Customer
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => handleQuickLogin("admin@alnawab.com", "Admin@12345")}
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => handleQuickLogin("manager@alnawab.com", "Manager@123")}
                  >
                    👔 Manager
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => handleQuickLogin("chef@alnawab.com", "Chef@123")}
                  >
                    👨‍🍳 Head Chef
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => handleQuickLogin("waiter@alnawab.com", "Waiter@123")}
                  >
                    🛎️ Waiter
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => handleQuickLogin("delivery@alnawab.com", "Delivery@123")}
                  >
                    🛵 Delivery
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="auth-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your royal name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="auth-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="auth-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="auth-form-group">
                <label>Create Password (min. 6 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginTop: "0.5rem" }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register & Get 50 Loyalty Points"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
