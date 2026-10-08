"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import { orderService } from "../services/orderService";
import { getSocket } from "../services/socket";
import { ChefHat, Clock, CheckCircle, RefreshCw, Home } from "lucide-react";
import "./kitchen.css";

export default function KitchenDisplayPage() {
  const { user, openAuthModal } = useAuth();
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadKitchenTickets = async () => {
    try {
      setLoading(true);
      const res = await adminService.getKitchenOrders();
      if (res.success && res.orders) {
        setKitchenOrders(res.orders);
      }
    } catch (err) {
      console.error("Failed to load kitchen tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "CHEF" || user.role === "ADMIN" || user.role === "MANAGER")) {
      loadKitchenTickets();

      const socket = getSocket();
      if (socket) {
        socket.emit("join_staff_room", "kitchen");
        socket.on("kitchen_orders_updated", () => {
          loadKitchenTickets();
        });
        socket.on("new_incoming_order", (newOrd) => {
          setKitchenOrders((prev) => [...prev, newOrd]);
        });
      }

      return () => {
        if (socket) {
          socket.off("kitchen_orders_updated");
          socket.off("new_incoming_order");
        }
      };
    }
  }, [user]);

  if (!user || (user.role !== "CHEF" && user.role !== "ADMIN" && user.role !== "MANAGER")) {
    return (
      <div className="kitchen-screen-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
        <ChefHat size={56} color="var(--color-gold)" style={{ margin: "0 auto 1rem auto" }} />
        <h1>Al-Nawab Royal Kitchen Display (KDS)</h1>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
          This screen is reserved for Royal Kitchen Chefs & Master Ustads.
        </p>
        <button className="btn-primary" onClick={() => openAuthModal("login")}>
          Chef Sign In
        </button>
      </div>
    );
  }

  const handleAdvance = async (orderId) => {
    try {
      const res = await adminService.advanceKitchenOrder(orderId);
      if (res.success) {
        loadKitchenTickets();
      }
    } catch (err) {
      alert("Failed to advance ticket");
    }
  };

  return (
    <div className="kitchen-screen-container">
      <header className="kitchen-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ChefHat size={36} color="var(--color-gold)" />
          <div>
            <h1>Royal Kitchen Station (KDS)</h1>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              Active Station: Chef {user.name} • {kitchenOrders.length} tickets in queue
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn-secondary"
            style={{ color: "var(--color-gold)", borderColor: "var(--color-gold)" }}
            onClick={loadKitchenTickets}
          >
            <RefreshCw size={16} style={{ display: "inline", marginRight: 6 }} /> Refresh
          </button>
          <Link href="/" className="btn-secondary" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
            <Home size={16} style={{ display: "inline", marginRight: 6 }} /> Return to Site
          </Link>
        </div>
      </header>

      {loading ? (
        <p>Loading cooking tickets...</p>
      ) : kitchenOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", opacity: 0.7 }}>
          <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 1rem auto" }} />
          <h2>All orders served & up to date!</h2>
          <p>The royal kitchen is ready for new orders.</p>
        </div>
      ) : (
        <div className="kitchen-orders-grid">
          {kitchenOrders.map((ord) => {
            const isCooking = ord.status === "PREPARING";
            return (
              <div key={ord._id} className="kitchen-ticket-card">
                <div className="kitchen-ticket-header">
                  <div>
                    <h3>#{ord.orderNumber}</h3>
                    <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                      {ord.orderType} {ord.tableNumber ? `• Table ${ord.tableNumber}` : ""}
                    </span>
                  </div>
                  <span className="kitchen-time-badge">
                    <Clock size={14} /> {ord.status}
                  </span>
                </div>

                <div className="kitchen-ticket-body">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="kitchen-ticket-item">
                      <div>
                        <span className="kitchen-item-qty">{it.quantity}x</span>
                        <strong style={{ fontSize: "1.05rem" }}>{it.name}</strong>
                        {it.specialInstructions && (
                          <div style={{ color: "#facc15", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                            ⚠️ Special Note: {it.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="kitchen-ticket-footer">
                  {isCooking ? (
                    <button
                      className="kitchen-action-btn"
                      onClick={() => handleAdvance(ord._id)}
                    >
                      ✓ Mark Ready for Pickup / Serving
                    </button>
                  ) : (
                    <button
                      className="kitchen-action-btn btn-prepare"
                      onClick={() => handleAdvance(ord._id)}
                    >
                      🔥 Start Preparing Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
