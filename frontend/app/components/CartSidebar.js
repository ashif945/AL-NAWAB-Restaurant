"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  Tag,
  Clock,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import "./CartSidebar.css";

export default function CartSidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: cart, 1: checkout, 2: success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const {
    cart,
    dispatch,
    getSubtotal,
    getDiscount,
    getDeliveryFee,
    getTax,
    getCartTotal,
    getCartCount,
    applyCouponCode,
  } = useCart();

  const { user, openAuthModal } = useAuth();

  // Checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Auto-fill customer details from AuthContext if available
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
      if (user.addresses && user.addresses.length > 0) {
        const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setDeliveryAddress(`${def.street}, ${def.landmark ? `${def.landmark}, ` : ""}${def.city} ${def.pincode}`);
      }
    }
  }, [user]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setCheckoutStep(0);
      setErrorMsg("");
    }
  };

  const handleUpdateQuantity = (item, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id || item._id, quantity } });
  };

  const handleRemove = (item) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id: item.id || item._id } });
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setErrorMsg("");
    const res = await applyCouponCode(couponInput.trim());
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setCouponInput("");
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const orderPayload = {
        items: cart.items.map((it) => ({
          menuItemId: it._id,
          id: it.id || it.legacyId,
          name: it.name,
          quantity: it.quantity,
          specialInstructions: it.specialInstructions || "",
        })),
        customerDetails: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
        },
        orderType: cart.orderType || "DELIVERY",
        deliveryAddress: cart.orderType === "DELIVERY" ? deliveryAddress : "",
        deliveryInstructions,
        pickupTime: cart.orderType === "PICKUP" ? pickupTime : "",
        tableNumber: cart.orderType === "DINE_IN" ? cart.tableNumber : "",
        paymentMethod,
        couponCode: cart.coupon ? cart.coupon.code : "",
      };

      const res = await orderService.createOrder(orderPayload);

      if (res.success && res.order) {
        const createdOrder = res.order;
        setPlacedOrder(createdOrder);

        // If online payment, perform quick verification flow
        if (paymentMethod === "ONLINE") {
          const payRes = await paymentService.createPaymentOrder(createdOrder._id);
          if (payRes.success) {
            await paymentService.verifyPayment({
              transactionId: payRes.transactionId,
              gatewayOrderId: payRes.gatewayOrderId,
              gatewayPaymentId: `pay_${Date.now()}`,
              gatewaySignature: "simulated_success_sig",
              paymentMethod: "UPI",
            });
          }
        }

        dispatch({ type: "CLEAR_CART" });
        setCheckoutStep(2);
      } else {
        setErrorMsg(res.message || "Unable to place order. Please try again.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to place order. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="cart-trigger-btn" onClick={handleToggle} aria-label="View Cart">
        <ShoppingCart size={24} />
        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
      </button>

      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={handleToggle}></div>

      <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>
            {checkoutStep === 1
              ? "Royal Checkout"
              : checkoutStep === 2
              ? "Order Confirmed"
              : "Your Royal Feast"}
          </h2>
          <button className="cart-close-btn" onClick={handleToggle}>
            <X size={22} />
          </button>
        </div>

        <div className="cart-content">
          {checkoutStep === 0 && (
            <>
              {/* Dining Mode Picker */}
              <div className="order-type-picker">
                <button
                  type="button"
                  className={`order-type-btn ${cart.orderType === "DELIVERY" ? "active" : ""}`}
                  onClick={() => dispatch({ type: "SET_ORDER_TYPE", payload: "DELIVERY" })}
                >
                  🛵 Delivery
                </button>
                <button
                  type="button"
                  className={`order-type-btn ${cart.orderType === "PICKUP" ? "active" : ""}`}
                  onClick={() => dispatch({ type: "SET_ORDER_TYPE", payload: "PICKUP" })}
                >
                  🥡 Takeaway
                </button>
                <button
                  type="button"
                  className={`order-type-btn ${cart.orderType === "DINE_IN" ? "active" : ""}`}
                  onClick={() => dispatch({ type: "SET_ORDER_TYPE", payload: "DINE_IN" })}
                >
                  🍽️ Dine-In
                </button>
              </div>

              {cart.orderType === "DINE_IN" && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Table Number (e.g. T-01)"
                    value={cart.tableNumber || ""}
                    onChange={(e) => dispatch({ type: "SET_TABLE_NUMBER", payload: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid var(--color-gold)",
                      background: "#fff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              )}

              {cart.items.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} style={{ opacity: 0.5, marginBottom: "0.5rem" }} />
                  <p>Your royal dastarkhwan is empty.</p>
                  <button className="btn-primary mt-4" onClick={handleToggle}>
                    Explore Royal Menu
                  </button>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div key={item._id || item.id} className="cart-item">
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <span className="cart-item-price">₹{item.price * item.quantity}</span>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="remove-btn" onClick={() => handleRemove(item)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.items.length > 0 && (
                <div className="coupon-section">
                  {cart.coupon ? (
                    <div className="applied-coupon-pill">
                      <span>
                        🏷️ Code <strong>{cart.coupon.code}</strong> applied (-₹{getDiscount()})
                      </span>
                      <button
                        className="remove-btn"
                        style={{ color: "#991b1b" }}
                        onClick={() => dispatch({ type: "REMOVE_COUPON" })}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        className="coupon-input"
                        placeholder="Promo code (e.g. ROYAL10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-primary coupon-apply-btn"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {errorMsg && <div className="checkout-error-banner">{errorMsg}</div>}
                </div>
              )}
            </>
          )}

          {checkoutStep === 1 && (
            <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
              {errorMsg && <div className="checkout-error-banner">{errorMsg}</div>}

              <h3>Patron Details</h3>
              <input
                type="text"
                placeholder="Full Name *"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                type="tel"
                placeholder="Mobile Number *"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />

              {cart.orderType === "DELIVERY" && (
                <>
                  <h3>Delivery Location</h3>
                  <textarea
                    placeholder="Full Address (House/Flat No., Street, Sector, Pincode) *"
                    required
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  ></textarea>
                  <input
                    type="text"
                    placeholder="Delivery Instructions (Optional)"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </>
              )}

              {cart.orderType === "PICKUP" && (
                <>
                  <h3>Takeaway Timing</h3>
                  <input
                    type="text"
                    placeholder="Pickup Time (e.g. in 30 mins)"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </>
              )}

              {cart.orderType === "DINE_IN" && (
                <>
                  <h3>Table Assignment</h3>
                  <input
                    type="text"
                    placeholder="Table Number (e.g. T-01) *"
                    required
                    value={cart.tableNumber || ""}
                    onChange={(e) => dispatch({ type: "SET_TABLE_NUMBER", payload: e.target.value })}
                  />
                </>
              )}

              <h3 className="mt-2">Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                  />
                  <span className="payment-box">
                    <Smartphone size={22} />
                    <span>UPI / QR</span>
                  </span>
                </label>

                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                  />
                  <span className="payment-box">
                    <CreditCard size={22} />
                    <span>Card / COD</span>
                  </span>
                </label>

                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                  />
                  <span className="payment-box">
                    <Banknote size={22} />
                    <span>Razorpay</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary full-width mt-4"
                disabled={loading}
              >
                {loading ? "Confirming Order..." : `Place Order • ₹${getCartTotal()}`}
              </button>
              <button
                type="button"
                className="btn-secondary full-width mt-2"
                onClick={() => setCheckoutStep(0)}
              >
                Back to Cart
              </button>
            </form>
          )}

          {checkoutStep === 2 && placedOrder && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3 style={{ color: "var(--color-gold)", margin: 0 }}>Order Confirmed!</h3>
              <p style={{ color: "#6d5750", margin: 0 }}>
                Your royal feast has been sent to the royal kitchens of Awadh.
              </p>
              <div className="order-placed-number">
                Order ID: {placedOrder.orderNumber}
              </div>

              <button
                className="btn-primary full-width mt-4"
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/orders/${placedOrder.orderNumber}`);
                }}
              >
                Track Live Order Status <ArrowRight size={16} style={{ display: "inline", marginLeft: 4 }} />
              </button>

              <button
                className="btn-secondary full-width mt-2"
                onClick={() => {
                  setCheckoutStep(0);
                  setIsOpen(false);
                }}
              >
                Return to Menu
              </button>
            </div>
          )}
        </div>

        {cart.items.length > 0 && checkoutStep === 0 && (
          <div className="cart-footer">
            <div className="cart-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>₹{getSubtotal()}</span>
              </div>
              {getDiscount() > 0 && (
                <div className="breakdown-row discount">
                  <span>Promo Discount</span>
                  <span>-₹{getDiscount()}</span>
                </div>
              )}
              {cart.orderType === "DELIVERY" && (
                <div className="breakdown-row">
                  <span>Delivery Fee</span>
                  <span>{getDeliveryFee() === 0 ? "FREE" : `₹${getDeliveryFee()}`}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>GST (5%)</span>
                <span>₹{getTax()}</span>
              </div>
            </div>

            <div className="cart-total">
              <span>Grand Total</span>
              <span>₹{getCartTotal()}</span>
            </div>

            <button
              className="btn-primary full-width"
              onClick={() => {
                setErrorMsg("");
                setCheckoutStep(1);
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
