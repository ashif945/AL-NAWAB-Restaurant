"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { adminService } from "../services/adminService";
import { User, MapPin, Plus, Trash2, KeyRound, Sparkles, Award } from "lucide-react";
import "../page.css";
import "./profile.css";

export default function ProfilePage() {
  const { user, refreshUser, openAuthModal } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Noida");
  const [pincode, setPincode] = useState("201304");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Loyalty history
  const [loyaltyData, setLoyaltyData] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");

      async function loadLoyalty() {
        try {
          const res = await adminService.getLoyaltyBalance();
          if (res.success) {
            setLoyaltyData(res);
          }
        } catch (e) {
          // ignore
        }
      }
      loadLoyalty();
    }
  }, [user]);

  if (!user) {
    return (
      <main className="main">
        <Navbar activePage="profile" />
        <div className="profile-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
          <h2>Patron Profile</h2>
          <p>Please sign in to manage your addresses and view royal rewards.</p>
          <button className="btn-primary mt-4" onClick={() => openAuthModal("login")}>
            Sign In
          </button>
        </div>
      </main>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const res = await authService.updateProfile({ name, phone });
      if (res.success) {
        setProfileMsg("Profile updated successfully!");
        refreshUser();
      }
    } catch (err) {
      setProfileMsg("Failed to update profile.");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.addAddress({
        street,
        landmark,
        city,
        state: "Uttar Pradesh",
        pincode,
        isDefault: !user.addresses || user.addresses.length === 0,
      });
      if (res.success) {
        setStreet("");
        setLandmark("");
        setShowAddressForm(false);
        refreshUser();
      }
    } catch (err) {
      alert("Failed to save address");
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await authService.deleteAddress(addrId);
      refreshUser();
    } catch (err) {
      alert("Failed to delete address");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");
    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPwdMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      setPwdError(err.message || "Failed to change password");
    }
  };

  return (
    <main className="main">
      <Navbar activePage="profile" />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name ? user.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div>
            <h1>{user.name}</h1>
            <p className="profile-meta">
              {user.email} • {user.phone} • Role: <strong>{user.role}</strong>
            </p>
          </div>
        </div>

        {/* Loyalty Points Banner */}
        <div className="loyalty-card">
          <div className="loyalty-icon-wrap">
            <Award size={36} color="var(--color-gold)" />
          </div>
          <div className="loyalty-content">
            <h3>Al-Nawab Royal Rewards Tier</h3>
            <p>Every ₹100 spent earns 10 Royal Points to redeem on future feasts.</p>
            <div className="loyalty-points-display">
              <span>🪙 Available Balance:</span>
              <strong>{user.loyaltyPoints || 0} Points (₹{user.loyaltyPoints || 0} value)</strong>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal Info */}
          <div className="profile-card">
            <h3>Personal Information</h3>
            {profileMsg && <div className="profile-success-pill">{profileMsg}</div>}
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="profile-card">
            <h3>Security & Password</h3>
            {pwdMsg && <div className="profile-success-pill">{pwdMsg}</div>}
            {pwdError && <div className="profile-error-pill">{pwdError}</div>}
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (min 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-secondary" style={{ alignSelf: "flex-start" }}>
                Update Password
              </button>
            </form>
          </div>

          {/* Saved Addresses */}
          <div className="profile-card profile-full-width">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>Saved Delivery Addresses</h3>
              <button
                className="btn-secondary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                <Plus size={14} style={{ display: "inline", marginRight: 4 }} />
                Add New Address
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="address-form-box">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                  <input
                    type="text"
                    placeholder="House/Flat No., Building, Street *"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Landmark (e.g. Near Metro)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Pincode *"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0.5rem 1rem" }}
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="addresses-list-grid">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr) => (
                  <div key={addr._id} className="address-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <MapPin size={18} color="var(--color-gold)" />
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          {addr.city} {addr.pincode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#6d5750" }}>
                      {addr.street} {addr.landmark && `(${addr.landmark})`}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: "#6d5750", fontSize: "0.9rem" }}>No addresses saved yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
