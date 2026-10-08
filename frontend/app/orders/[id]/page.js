"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { orderService } from "../../services/orderService";
import { reviewService } from "../../services/reviewService";
import { getSocket } from "../../services/socket";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Bike,
  Home,
  AlertCircle,
  Star,
  RefreshCw,
} from "lucide-react";
import "../../page.css";
import "./page.css";

const STATUS_STEPS = [
  { id: "ORDER_PLACED", label: "Order Placed", icon: Clock },
  { id: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { id: "PREPARING", label: "Royal Kitchen Preparing", icon: ChefHat },
  { id: "READY", label: "Ready to Serve / Dispatch", icon: PackageCheck },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Bike },
  { id: "DELIVERED", label: "Delivered / Enjoy Feast", icon: Home },
];

export default function OrderTrackingPage({ params }) {
  const unwrappedParams = use(params);
  const orderIdParam = unwrappedParams.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrderById(orderIdParam);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Socket.IO Real-time updates
    const socket = getSocket();
    if (socket) {
      socket.emit("join_order", orderIdParam);
      socket.on("order_status_updated", (updatedOrder) => {
        if (
          updatedOrder._id === orderIdParam ||
          updatedOrder.orderNumber === orderIdParam
        ) {
          setOrder(updatedOrder);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("order_status_updated");
      }
    };
  }, [orderIdParam]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      const res = await orderService.cancelOrder(order._id, cancelReason);
      if (res.success) {
        setOrder(res.order);
        setCancelModal(false);
      }
    } catch (err) {
      alert(err.message || "Could not cancel order");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewService.createReview({
        orderId: order._id,
        customerName: order.customerDetails?.name || "Patron",
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
    } catch (err) {
      alert(err.message || "Failed to submit review");
    }
  };

  const getStepIndex = (status) => {
    if (status === "COMPLETED") return 5;
    if (status === "CANCELLED" || status === "REFUNDED") return -1;
    return STATUS_STEPS.findIndex((s) => s.id === status);
  };

  if (loading) {
    return (
      <main className="main">
        <Navbar activePage="orders" />
        <div className="order-tracking-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
          <h2>Locating your royal order...</h2>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="main">
        <Navbar activePage="orders" />
        <div className="order-tracking-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
          <AlertCircle size={48} color="#dc2626" style={{ margin: "0 auto 1rem auto" }} />
          <h2>Order Not Found</h2>
          <p>{error || "We could not find an order matching that ID."}</p>
          <Link href="/menu" className="btn-primary mt-4" style={{ display: "inline-block" }}>
            Return to Menu
          </Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = getStepIndex(order.status);
  const isCancellable = order.status === "ORDER_PLACED" || order.status === "CONFIRMED";

  return (
    <main className="main">
      <Navbar activePage="orders" />

      <div className="order-tracking-container">
        {/* Order Header Card */}
        <div className="order-header-card">
          <div className="order-title-group">
            <h1>Order #{order.orderNumber}</h1>
            <div className="order-meta-info">
              <span>📅 {new Date(order.createdAt).toLocaleString()}</span>
              <span>🍽️ {order.orderType}</span>
              {order.tableNumber && <span>🛎️ Table {order.tableNumber}</span>}
              <span>💳 {order.paymentMethod} ({order.paymentStatus})</span>
            </div>
          </div>

          <div className={`order-status-badge status-${order.status}`}>
            {order.status.replace(/_/g, " ")}
          </div>
        </div>

        {/* Live Timeline Card */}
        {order.status !== "CANCELLED" && (
          <div className="order-timeline-card">
            <h3 style={{ color: "var(--color-gold)", margin: 0 }}>Live Preparation Timeline</h3>
            <p style={{ color: "#6d5750", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
              Status updates in real time from Al-Nawab kitchens
            </p>

            <div className="timeline-steps">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentStepIndex > idx;
                const isActive = currentStepIndex === idx;

                return (
                  <div
                    key={step.id}
                    className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                  >
                    <div className="timeline-icon">
                      <Icon size={20} />
                    </div>
                    <span className="timeline-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Breakdown Grid */}
        <div className="order-details-grid">
          {/* Items */}
          <div className="order-items-card">
            <h3>Dishes in this Feast</h3>
            <div className="order-items-list">
              {order.items.map((it, idx) => (
                <div key={idx} className="order-item-row">
                  <div className="order-item-info">
                    <span className="order-item-qty">{it.quantity}x</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{it.name}</h4>
                      {it.specialInstructions && (
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#887068" }}>
                          Note: {it.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="order-summary-card">
            <h3>Bill Summary</h3>
            <div className="order-breakdown-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="order-breakdown-row" style={{ color: "#16a34a" }}>
                <span>Discount ({order.couponCode || "Points"})</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="order-breakdown-row">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
            )}
            <div className="order-breakdown-row">
              <span>GST (5%)</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="order-breakdown-row total">
              <span>Total Paid / Due</span>
              <span>₹{order.total}</span>
            </div>

            {order.deliveryAddress && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(202, 162, 77, 0.2)" }}>
                <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", color: "var(--color-charcoal)" }}>
                  Delivery Address:
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6d5750" }}>
                  {order.deliveryAddress}
                </p>
              </div>
            )}

            {order.loyaltyPointsEarned > 0 && (
              <div style={{ marginTop: "1rem", background: "rgba(202, 162, 77, 0.12)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                🪙 You earned <strong>{order.loyaltyPointsEarned} Royal Points</strong> on this feast!
              </div>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="order-actions-bar">
          <Link href="/menu" className="btn-secondary">
            Order More Delicacies
          </Link>

          {isCancellable && (
            <button
              className="btn-secondary"
              style={{ color: "#dc2626", borderColor: "#dc2626" }}
              onClick={() => setCancelModal(true)}
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Post-Feast Review Modal */}
        {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
          <div className="order-timeline-card" style={{ marginTop: "2rem" }}>
            <h3 style={{ color: "var(--color-gold)", margin: "0 0 0.5rem 0" }}>
              How was your Royal Dining Experience?
            </h3>
            {reviewSubmitted ? (
              <p style={{ color: "#166534", fontWeight: 600 }}>
                ✓ Thank you for your royal feedback! Your review has been published.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Star
                        size={24}
                        fill={star <= reviewRating ? "var(--color-gold)" : "none"}
                        color="var(--color-gold)"
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Share your thoughts on the taste, aroma, and presentation..."
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(202, 162, 77, 0.3)",
                    fontFamily: "var(--font-inter)",
                  }}
                ></textarea>

                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
                  Submit Royal Review
                </button>
              </form>
            )}
          </div>
        )}

        {/* Cancel Order Dialog */}
        {cancelModal && (
          <div className="auth-modal-overlay" onClick={() => setCancelModal(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="auth-modal-header">
                <h3 style={{ margin: 0, color: "#991b1b" }}>Cancel Royal Order</h3>
              </div>
              <div className="auth-modal-body">
                <p>Are you sure you want to cancel order #{order.orderNumber}?</p>
                <input
                  type="text"
                  placeholder="Reason for cancellation (Optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    marginBottom: "1rem",
                  }}
                />
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    className="btn-primary"
                    style={{ backgroundColor: "#dc2626" }}
                    onClick={handleCancelOrder}
                  >
                    Confirm Cancellation
                  </button>
                  <button className="btn-secondary" onClick={() => setCancelModal(false)}>
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
