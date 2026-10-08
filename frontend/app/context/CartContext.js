"use client";
import { createContext, useContext, useReducer, useEffect } from "react";
import { couponService } from "../services/couponService";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "alnawab_cart_v2";

const initialState = {
  items: [],
  orderType: "DELIVERY", // DELIVERY, PICKUP, DINE_IN
  tableNumber: "",
  coupon: null,
  specialInstructions: "",
  useLoyaltyPoints: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_CART":
      return { ...state, ...action.payload };

    case "ADD_ITEM": {
      const targetId = action.payload._id || action.payload.id;
      const existingIndex = state.items.findIndex(
        (item) => (item._id || item.id) === targetId
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            ...action.payload,
            quantity: 1,
            specialInstructions: action.payload.specialInstructions || "",
          },
        ];
      }
      return { ...state, items: newItems };
    }

    case "REMOVE_ITEM": {
      const targetId = action.payload.id || action.payload._id;
      return {
        ...state,
        items: state.items.filter(
          (item) => (item._id || item.id) !== targetId
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const targetId = action.payload.id || action.payload._id;
      const quantity = action.payload.quantity;

      if (quantity < 1) {
        return {
          ...state,
          items: state.items.filter(
            (item) => (item._id || item.id) !== targetId
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          (item._id || item.id) === targetId ? { ...item, quantity } : item
        ),
      };
    }

    case "UPDATE_INSTRUCTIONS": {
      const targetId = action.payload.id || action.payload._id;
      return {
        ...state,
        items: state.items.map((item) =>
          (item._id || item.id) === targetId
            ? { ...item, specialInstructions: action.payload.instructions }
            : item
        ),
      };
    }

    case "SET_ORDER_TYPE":
      return { ...state, orderType: action.payload };

    case "SET_TABLE_NUMBER":
      return {
        ...state,
        tableNumber: action.payload,
        orderType: action.payload ? "DINE_IN" : state.orderType,
      };

    case "SET_COUPON":
      return { ...state, coupon: action.payload };

    case "REMOVE_COUPON":
      return { ...state, coupon: null };

    case "SET_USE_LOYALTY":
      return { ...state, useLoyaltyPoints: action.payload };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        coupon: null,
        useLoyaltyPoints: false,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.items)) {
            dispatch({ type: "INITIALIZE_CART", payload: parsed });
          }
        }
      } catch (e) {
        console.error("Failed to load cart from storage:", e);
      }
    }
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save cart to storage:", e);
      }
    }
  }, [state]);

  const getSubtotal = () => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getDiscount = () => {
    const subtotal = getSubtotal();
    if (!state.coupon) return 0;
    if (subtotal < (state.coupon.minOrderAmount || 0)) return 0;

    let discount = 0;
    if (state.coupon.discountType === "PERCENTAGE") {
      discount = Math.round((subtotal * state.coupon.discountValue) / 100);
      if (state.coupon.maxDiscountAmount) {
        discount = Math.min(discount, state.coupon.maxDiscountAmount);
      }
    } else {
      discount = state.coupon.discountValue;
    }
    return Math.min(discount, subtotal);
  };

  const getDeliveryFee = () => {
    if (state.orderType !== "DELIVERY") return 0;
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 500 ? 0 : 40;
  };

  const getTax = () => {
    const net = Math.max(0, getSubtotal() - getDiscount());
    return Math.round(net * 0.05); // 5% GST
  };

  const getCartTotal = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    const discount = getDiscount();
    const delivery = getDeliveryFee();
    const tax = getTax();
    return Math.max(0, subtotal - discount + delivery + tax);
  };

  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const applyCouponCode = async (code) => {
    try {
      const subtotal = getSubtotal();
      const res = await couponService.validateCoupon(code, subtotal);
      if (res.success && res.coupon) {
        dispatch({ type: "SET_COUPON", payload: res.coupon });
        return { success: true, message: res.message, discount: res.coupon.discountAmount };
      }
      return { success: false, message: res.message || "Invalid coupon" };
    } catch (err) {
      return { success: false, message: err.message || "Failed to validate coupon" };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        dispatch,
        getSubtotal,
        getDiscount,
        getDeliveryFee,
        getTax,
        getCartTotal,
        getCartCount,
        applyCouponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
