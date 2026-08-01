"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { ShoppingCart, X, Plus, Minus, CreditCard, Banknote } from "lucide-react";
import "./CartSidebar.css";

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: cart, 1: checkout, 2: success
  const { cart, dispatch, getCartTotal, getCartCount } = useCart();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setCheckoutStep(0);
  };

  const handleUpdateQuantity = (item, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity } });
  };

  const handleRemove = (item) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id: item.id } });
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setCheckoutStep(2);
    setTimeout(() => {
      dispatch({ type: "CLEAR_CART" });
      setCheckoutStep(0);
      setIsOpen(false);
    }, 3000);
  };

  return (
    <>
      <button className="cart-trigger-btn" onClick={handleToggle}>
        <ShoppingCart size={24} />
        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
      </button>

      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={handleToggle}></div>

      <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>{checkoutStep === 1 ? "Checkout" : checkoutStep === 2 ? "Order Placed" : "Your Royal Feast"}</h2>
          <button className="cart-close-btn" onClick={handleToggle}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {checkoutStep === 0 && (
            <>
              {cart.items.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} />
                  <p>Your dastarkhwan is empty.</p>
                  <button className="btn-primary mt-4" onClick={handleToggle}>Browse Menu</button>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <span className="cart-item-price">₹{item.price}</span>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)}><Minus size={16}/></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}><Plus size={16}/></button>
                        </div>
                        <button className="remove-btn" onClick={() => handleRemove(item)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 1 && (
            <form className="checkout-form" onSubmit={handleCheckout}>
              <h3>Delivery Details</h3>
              <input type="text" placeholder="Full Name" required />
              <input type="tel" placeholder="Phone Number" required />
              <textarea placeholder="Delivery Address" required rows={3}></textarea>
              
              <h3 className="mt-4">Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-method">
                  <input type="radio" name="payment" value="upi" required defaultChecked />
                  <span className="payment-box">
                    <Banknote size={24} />
                    <span>UPI</span>
                  </span>
                </label>
                <label className="payment-method">
                  <input type="radio" name="payment" value="card" required />
                  <span className="payment-box">
                    <CreditCard size={24} />
                    <span>Card on Delivery</span>
                  </span>
                </label>
              </div>
              
              <button type="submit" className="btn-primary full-width mt-4">Place Order (₹{getCartTotal()})</button>
              <button type="button" className="btn-secondary full-width mt-2" onClick={() => setCheckoutStep(0)}>Back to Cart</button>
            </form>
          )}

          {checkoutStep === 2 && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Order Confirmed!</h3>
              <p>Your royal feast is being prepared. It will arrive in 45 minutes.</p>
            </div>
          )}
        </div>

        {cart.items.length > 0 && checkoutStep === 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <button className="btn-primary full-width" onClick={() => setCheckoutStep(1)}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
