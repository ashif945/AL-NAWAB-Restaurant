"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";
import "../page.css";
import "./[id]/page.css";

export default function OrdersHistoryPage() {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await orderService.getMyOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <main className="main">
        <Navbar activePage="orders" />
        <div className="order-tracking-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
          <ShoppingBag size={52} color="var(--color-gold)" style={{ margin: "0 auto 1rem auto" }} />
          <h2>Patron Sign-In Required</h2>
          <p>Please sign in to view your royal orders history and live track status.</p>
          <button className="btn-primary mt-4" onClick={() => openAuthModal("login")}>
            Sign In to Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <Navbar activePage="orders" />

      <div className="order-tracking-container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", color: "var(--color-charcoal)", margin: 0 }}>
            Your Feast History
          </h1>
          <p style={{ color: "#6d5750", margin: "0.25rem 0 0 0" }}>
            Track and re-order your favorite royal preparations
          </p>
        </div>

        {loading ? (
          <p>Loading royal orders...</p>
        ) : orders.length === 0 ? (
          <div className="order-items-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <ShoppingBag size={48} color="var(--color-gold)" style={{ margin: "0 auto 1rem auto", opacity: 0.5 }} />
            <h3>No past orders recorded yet</h3>
            <p style={{ color: "#6d5750" }}>Start your journey through the royal kitchens of Awadh.</p>
            <Link href="/menu" className="btn-primary mt-4" style={{ display: "inline-block" }}>
              Explore Royal Menu
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((ord) => (
              <div key={ord._id} className="order-header-card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <h3 style={{ margin: 0, color: "var(--color-charcoal)", fontSize: "1.3rem" }}>
                      Order #{ord.orderNumber}
                    </h3>
                    <span className={`order-status-badge status-${ord.status}`} style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem" }}>
                      {ord.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#6d5750" }}>
                    {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ord.items.length} items • ₹{ord.total}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {ord.items.slice(0, 3).map((it, idx) => (
                      <span key={idx} style={{ fontSize: "0.8rem", background: "rgba(202, 162, 77, 0.12)", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>
                        {it.name} (x{it.quantity})
                      </span>
                    ))}
                    {ord.items.length > 3 && (
                      <span style={{ fontSize: "0.8rem", color: "var(--color-gold)", fontWeight: 600 }}>
                        +{ord.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Link href={`/orders/${ord.orderNumber}`} className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem" }}>
                  Live Tracking <ArrowRight size={14} style={{ display: "inline", marginLeft: 4 }} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
