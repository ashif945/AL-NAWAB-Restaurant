"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { User, LogOut, Shield, ChefHat, ShoppingBag, UtensilsCrossed } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ activePage }) {
  const { user, logout, openAuthModal } = useAuth();
  const { getCartCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          Al-Nawab
        </Link>
        
        <nav className="nav">
          <Link
            href="/menu"
            className="nav-link"
            style={activePage === "menu" ? { color: "var(--color-gold)" } : {}}
          >
            Menu
          </Link>
          <Link href="/#feast" className="nav-link">
            The Royal Feast
          </Link>
          <Link href="/#reservations" className="nav-link">
            Reservations
          </Link>
          <Link href="/#contact" className="nav-link">
            Contact
          </Link>

          {user && (
            <Link
              href="/orders"
              className="nav-link"
              style={activePage === "orders" ? { color: "var(--color-gold)" } : {}}
            >
              My Orders
            </Link>
          )}

          {user && (user.role === "ADMIN" || user.role === "MANAGER") && (
            <Link
              href="/admin"
              className="nav-link admin-nav-badge"
              style={activePage === "admin" ? { color: "var(--color-gold)" } : {}}
            >
              Admin Portal
            </Link>
          )}

          {user && (user.role === "CHEF" || user.role === "ADMIN") && (
            <Link
              href="/kitchen"
              className="nav-link kitchen-nav-badge"
              style={activePage === "kitchen" ? { color: "var(--color-gold)" } : {}}
            >
              Kitchen (KDS)
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-profile-menu">
              <button
                className="user-profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar-circle">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-text-wrap">
                  <span className="user-nav-name">{user.name.split(" ")[0]}</span>
                  <span className="user-nav-role">{user.role}</span>
                </div>
              </button>

              {showDropdown && (
                <div className="user-dropdown-card">
                  <div className="dropdown-loyalty-banner">
                    <span>Royal Points:</span>
                    <strong>🪙 {user.loyaltyPoints || 0} pts</strong>
                  </div>
                  <Link
                    href="/profile"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={16} /> My Profile & Addresses
                  </Link>
                  <Link
                    href="/orders"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <ShoppingBag size={16} /> Order History
                  </Link>

                  {user.role !== "CUSTOMER" && (
                    <Link
                      href="/admin"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Shield size={16} /> Admin Suite
                    </Link>
                  )}

                  {(user.role === "CHEF" || user.role === "ADMIN") && (
                    <Link
                      href="/kitchen"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <ChefHat size={16} /> Kitchen Screen
                    </Link>
                  )}

                  <button
                    className="dropdown-item logout-item"
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-secondary patron-signin-btn"
              onClick={() => openAuthModal("login")}
            >
              Sign In
            </button>
          )}

          <Link href="/menu" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: "0.75rem" }}>
            Order Online
          </Link>
        </div>
      </div>
    </header>
  );
}
