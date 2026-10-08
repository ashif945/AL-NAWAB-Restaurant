"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import { orderService } from "../services/orderService";
import { menuService } from "../services/menuService";
import { tableService } from "../services/tableService";
import { reservationService } from "../services/reservationService";
import { couponService } from "../services/couponService";
import { reviewService } from "../services/reviewService";
import { getSocket } from "../services/socket";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Grid3X3,
  CalendarDays,
  Users,
  Tag,
  Boxes,
  MessageSquare,
  Settings,
  TrendingUp,
  DollarSign,
  ChefHat,
  QrCode,
  Check,
  X,
  Plus,
  RefreshCw,
  Eye,
  LogOut,
} from "lucide-react";
import "./admin.css";

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [statsData, setStatsData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [restaurantSettings, setRestaurantSettings] = useState(null);

  // Modals & form states
  const [selectedQRTable, setSelectedQRTable] = useState(null);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDish, setNewDish] = useState({
    name: "",
    category: "Biryani",
    price: "",
    description: "",
    isVeg: false,
    spiceLevel: "Medium",
  });
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "WAITER",
  });
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 300,
    maxDiscountAmount: 200,
    validUntil: "2030-12-31",
  });

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, menuRes, tablesRes, resvRes, staffRes, couponsRes, invRes, reviewsRes, settingsRes] =
        await Promise.allSettled([
          adminService.getDashboardStats(),
          orderService.getAllOrders({ limit: 100 }),
          menuService.getMenuItems(),
          tableService.getTables(),
          reservationService.getAllReservations(),
          adminService.getStaffList(),
          couponService.getCoupons(),
          adminService.getInventory(),
          reviewService.getAdminReviews(),
          adminService.getSettings(),
        ]);

      if (statsRes.status === "fulfilled" && statsRes.value.success) setStatsData(statsRes.value);
      if (ordersRes.status === "fulfilled" && ordersRes.value.success) setOrders(ordersRes.value.orders);
      if (menuRes.status === "fulfilled" && menuRes.value.success) setMenuItems(menuRes.value.items);
      if (tablesRes.status === "fulfilled" && tablesRes.value.success) setTables(tablesRes.value.tables);
      if (resvRes.status === "fulfilled" && resvRes.value.success) setReservations(resvRes.value.reservations);
      if (staffRes.status === "fulfilled" && staffRes.value.success) setStaffList(staffRes.value.staff);
      if (couponsRes.status === "fulfilled" && couponsRes.value.success) setCoupons(couponsRes.value.coupons);
      if (invRes.status === "fulfilled" && invRes.value.success) setInventory(invRes.value.items);
      if (reviewsRes.status === "fulfilled" && reviewsRes.value.success) setReviews(reviewsRes.value.reviews);
      if (settingsRes.status === "fulfilled" && settingsRes.value.success) setRestaurantSettings(settingsRes.value.settings);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "MANAGER")) {
      loadAllAdminData();

      // Listen for live socket events
      const socket = getSocket();
      if (socket) {
        socket.emit("join_staff_room", "admin");
        socket.on("new_incoming_order", (newOrd) => {
          setOrders((prev) => [newOrd, ...prev]);
        });
        socket.on("order_status_updated", (updOrd) => {
          setOrders((prev) => prev.map((o) => (o._id === updOrd._id ? updOrd : o)));
        });
      }

      return () => {
        if (socket) {
          socket.off("new_incoming_order");
          socket.off("order_status_updated");
        }
      };
    }
  }, [user]);

  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    return (
      <div style={{ padding: "5rem 2rem", textAlign: "center", background: "#f8f1eb", minHeight: "100vh" }}>
        <h2 style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-playfair)" }}>
          Al-Nawab Royal Administration Suite
        </h2>
        <p style={{ color: "#6d5750", marginBottom: "2rem" }}>
          This portal requires Administrator or Manager credentials.
        </p>
        <button className="btn-primary" onClick={() => openAuthModal("login")}>
          Admin Sign In
        </button>
      </div>
    );
  }

  // Action handlers
  const handleAdvanceOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, nextStatus, `Updated by Admin ${user.name}`);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.order : o)));
      }
    } catch (err) {
      alert(err.message || "Failed to update order status");
    }
  };

  const handleToggleDishAvailability = async (dishId, currentStatus) => {
    try {
      const res = await menuService.toggleAvailability(dishId, !currentStatus);
      if (res.success) {
        setMenuItems((prev) =>
          prev.map((d) => (d._id === dishId ? { ...d, isAvailable: !currentStatus } : d))
        );
      }
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      const res = await menuService.createMenuItem({
        ...newDish,
        price: Number(newDish.price),
      });
      if (res.success) {
        setMenuItems((prev) => [...prev, res.item]);
        setShowAddDishModal(false);
        setNewDish({ name: "", category: "Biryani", price: "", description: "", isVeg: false, spiceLevel: "Medium" });
      }
    } catch (err) {
      alert(err.message || "Failed to add dish");
    }
  };

  const handleUpdateTableStatus = async (tableId, status) => {
    try {
      const res = await tableService.updateTableStatus(tableId, status);
      if (res.success) {
        setTables((prev) => prev.map((t) => (t._id === tableId ? res.table : t)));
      }
    } catch (err) {
      alert("Failed to update table status");
    }
  };

  const handleViewQR = async (table) => {
    try {
      const res = await tableService.generateQR(table._id);
      if (res.success) {
        setSelectedQRTable({
          ...table,
          qrDataUrl: res.qrDataUrl,
          dineInUrl: res.dineInUrl,
        });
      }
    } catch (err) {
      alert("Failed to generate QR");
    }
  };

  const handleReservationStatus = async (resvId, status) => {
    try {
      const res = await reservationService.updateReservationStatus(resvId, status);
      if (res.success) {
        setReservations((prev) => prev.map((r) => (r._id === resvId ? res.reservation : r)));
      }
    } catch (err) {
      alert("Failed to update reservation");
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createStaff(newStaff);
      if (res.success) {
        setStaffList((prev) => [...prev, res.staffMember]);
        setShowAddStaffModal(false);
        setNewStaff({ name: "", email: "", phone: "", password: "", role: "WAITER" });
      }
    } catch (err) {
      alert(err.message || "Failed to create staff member");
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await couponService.createCoupon(newCoupon);
      if (res.success) {
        setCoupons((prev) => [res.coupon, ...prev]);
        setShowAddCouponModal(false);
      }
    } catch (err) {
      alert(err.message || "Failed to create coupon");
    }
  };

  const handleUpdateStock = async (itemId, newQty) => {
    try {
      const res = await adminService.updateInventoryStock(itemId, newQty);
      if (res.success) {
        setInventory((prev) => prev.map((i) => (i._id === itemId ? res.item : i)));
      }
    } catch (err) {
      alert("Failed to update stock");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.updateSettings(restaurantSettings);
      if (res.success) {
        alert("Restaurant settings saved successfully!");
      }
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">
          👑 Al-Nawab
        </Link>

        <nav className="admin-nav-list">
          <button
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={18} /> <span>Live Orders</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            <Utensils size={18} /> <span>Menu Management</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "tables" ? "active" : ""}`}
            onClick={() => setActiveTab("tables")}
          >
            <Grid3X3 size={18} /> <span>Tables & QR</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "reservations" ? "active" : ""}`}
            onClick={() => setActiveTab("reservations")}
          >
            <CalendarDays size={18} /> <span>Reservations</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "staff" ? "active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            <Users size={18} /> <span>Staff Roster</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "coupons" ? "active" : ""}`}
            onClick={() => setActiveTab("coupons")}
          >
            <Tag size={18} /> <span>Promos & Coupons</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <Boxes size={18} /> <span>Inventory Stock</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            <MessageSquare size={18} /> <span>Guest Reviews</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} /> <span>Restaurant Config</span>
          </button>
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(202, 162, 77, 0.2)", paddingTop: "1rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#d1c4b9", marginBottom: "0.5rem" }}>
            Signed in as <strong>{user.name}</strong>
          </div>
          <button
            className="admin-nav-item"
            style={{ width: "100%", color: "#fca5a5" }}
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <div className="admin-top-bar">
          <div>
            <h1 className="admin-page-title">
              {activeTab === "dashboard" && "Royal Executive Dashboard"}
              {activeTab === "orders" && "Live Order Processing"}
              {activeTab === "menu" && "Royal Menu Catalog"}
              {activeTab === "tables" && "Tables & QR Dine-In Management"}
              {activeTab === "reservations" && "Table Reservations"}
              {activeTab === "staff" && "Staff Accounts & Permissions"}
              {activeTab === "coupons" && "Promotional Offers & Discounts"}
              {activeTab === "inventory" && "Raw Ingredients & Stock"}
              {activeTab === "reviews" && "Guest Feedback & Testimonials"}
              {activeTab === "settings" && "Restaurant Operating Configuration"}
            </h1>
          </div>
          <button className="btn-secondary" onClick={loadAllAdminData}>
            <RefreshCw size={14} style={{ display: "inline", marginRight: 6 }} /> Refresh Data
          </button>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === "dashboard" && statsData && (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon"><DollarSign size={26} /></div>
                <div className="admin-stat-info">
                  <h4>Today's Revenue</h4>
                  <p>₹{statsData.stats?.todayRevenue || 0}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon"><ShoppingBag size={26} /></div>
                <div className="admin-stat-info">
                  <h4>Active Orders</h4>
                  <p>{statsData.stats?.activeOrdersCount || 0}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon"><Grid3X3 size={26} /></div>
                <div className="admin-stat-info">
                  <h4>Table Occupancy</h4>
                  <p>{statsData.stats?.tableOccupancyRate || 0}%</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon"><CalendarDays size={26} /></div>
                <div className="admin-stat-info">
                  <h4>Reservations</h4>
                  <p>{statsData.stats?.todayReservations || 0}</p>
                </div>
              </div>
            </div>

            {/* Weekly Trends & Popular Dishes */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>
              <div className="admin-panel-card">
                <div className="admin-panel-header">
                  <h3>7-Day Revenue & Order Trajectory</h3>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.weeklyTrends?.map((w, i) => (
                        <tr key={i}>
                          <td><strong>{w.date}</strong></td>
                          <td>{w.orders} orders</td>
                          <td style={{ fontWeight: 700, color: "var(--color-gold-hover)" }}>₹{w.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-panel-card">
                <div className="admin-panel-header">
                  <h3>Top Signature Dishes</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {statsData.popularDishes?.map((dish) => (
                    <div key={dish._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(202, 162, 77, 0.15)", paddingBottom: "0.5rem" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{dish.name}</h4>
                        <span style={{ fontSize: "0.8rem", color: "#887068" }}>{dish.category} • ★ {dish.rating}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--color-charcoal)" }}>₹{dish.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. LIVE ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>All Real-Time Orders ({orders.length})</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Dishes</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td>
                        <Link href={`/orders/${ord.orderNumber}`} style={{ color: "var(--color-gold)", fontWeight: 700 }}>
                          #{ord.orderNumber}
                        </Link>
                        <div style={{ fontSize: "0.75rem", color: "#887068" }}>
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div><strong>{ord.customerDetails?.name}</strong></div>
                        <div style={{ fontSize: "0.8rem", color: "#6d5750" }}>{ord.customerDetails?.phone}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{ord.orderType}</span>
                        {ord.tableNumber && <div style={{ fontSize: "0.75rem", color: "var(--color-gold)" }}>Table: {ord.tableNumber}</div>}
                      </td>
                      <td>
                        {ord.items.map((it, idx) => (
                          <div key={idx} style={{ fontSize: "0.8rem" }}>
                            {it.name} (x{it.quantity})
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{ord.total}</td>
                      <td>
                        <span className={`table-status-pill table-status-${ord.status}`}>
                          {ord.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          {ord.status === "ORDER_PLACED" && (
                            <button
                              className="btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => handleAdvanceOrderStatus(ord._id, "CONFIRMED")}
                            >
                              Confirm
                            </button>
                          )}
                          {ord.status === "CONFIRMED" && (
                            <button
                              className="btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#f97316" }}
                              onClick={() => handleAdvanceOrderStatus(ord._id, "PREPARING")}
                            >
                              Cook
                            </button>
                          )}
                          {ord.status === "PREPARING" && (
                            <button
                              className="btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#9333ea" }}
                              onClick={() => handleAdvanceOrderStatus(ord._id, "READY")}
                            >
                              Ready
                            </button>
                          )}
                          {ord.status === "READY" && (
                            <button
                              className="btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#10b981" }}
                              onClick={() =>
                                handleAdvanceOrderStatus(
                                  ord._id,
                                  ord.orderType === "DELIVERY" ? "OUT_FOR_DELIVERY" : "DELIVERED"
                                )
                              }
                            >
                              {ord.orderType === "DELIVERY" ? "Dispatch" : "Serve"}
                            </button>
                          )}
                          {ord.status === "OUT_FOR_DELIVERY" && (
                            <button
                              className="btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#15803d" }}
                              onClick={() => handleAdvanceOrderStatus(ord._id, "DELIVERED")}
                            >
                              Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MENU MANAGEMENT TAB */}
        {activeTab === "menu" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Dishes in Database ({menuItems.length})</h3>
              <button className="btn-primary" onClick={() => setShowAddDishModal(true)}>
                <Plus size={16} style={{ display: "inline", marginRight: 4 }} /> Add New Dish
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Category</th>
                    <th>Diet</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((dish) => (
                    <tr key={dish._id}>
                      <td>
                        <strong>{dish.name}</strong>
                        {dish.description && <div style={{ fontSize: "0.75rem", color: "#887068" }}>{dish.description}</div>}
                      </td>
                      <td>{dish.category}</td>
                      <td>
                        <span className={`veg-indicator ${dish.isVeg ? "veg" : "non-veg"}`} style={{ display: "inline-flex", width: 14, height: 14 }}>
                          <span style={{ width: 6, height: 6 }}></span>
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{dish.price}</td>
                      <td>
                        <span className={`table-status-pill ${dish.isAvailable ? "table-status-AVAILABLE" : "table-status-OCCUPIED"}`}>
                          {dish.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                          onClick={() => handleToggleDishAvailability(dish._id, dish.isAvailable)}
                        >
                          {dish.isAvailable ? "Mark Sold Out" : "Mark Available"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. TABLES & QR TAB */}
        {activeTab === "tables" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Restaurant Dining Tables</h3>
            </div>

            <div className="tables-grid-view">
              {tables.map((tbl) => (
                <div key={tbl._id} className="restaurant-table-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, color: "var(--color-charcoal)" }}>{tbl.tableNumber}</h3>
                    <span className={`table-status-pill table-status-${tbl.status}`}>
                      {tbl.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#6d5750" }}>
                    Section: {tbl.section} • Capacity: {tbl.capacity} Guests
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
                      onClick={() => handleViewQR(tbl)}
                    >
                      <QrCode size={14} style={{ display: "inline", marginRight: 4 }} /> QR Code
                    </button>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.8rem" }}
                      onClick={() =>
                        handleUpdateTableStatus(
                          tbl._id,
                          tbl.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE"
                        )
                      }
                    >
                      {tbl.status === "AVAILABLE" ? "Occupy" : "Free"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. RESERVATIONS TAB */}
        {activeTab === "reservations" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Table Bookings & Requests ({reservations.length})</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Date & Time</th>
                    <th>Party Size</th>
                    <th>Occasion</th>
                    <th>Table</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((resv) => (
                    <tr key={resv._id}>
                      <td>
                        <strong>{resv.name}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#6d5750" }}>{resv.phone}</div>
                      </td>
                      <td>
                        <strong>{resv.date}</strong> at {resv.time}
                      </td>
                      <td>{resv.guests} Guests</td>
                      <td>{resv.occasion || "Regular"}</td>
                      <td>{resv.tableNumber || "TBD"}</td>
                      <td>
                        <span className={`table-status-pill table-status-${resv.status}`}>
                          {resv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          {resv.status !== "ARRIVED" && resv.status !== "COMPLETED" && (
                            <button
                              className="btn-primary"
                              style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#10b981" }}
                              onClick={() => handleReservationStatus(resv._id, "ARRIVED")}
                            >
                              Arrived
                            </button>
                          )}
                          {resv.status !== "COMPLETED" && (
                            <button
                              className="btn-secondary"
                              style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => handleReservationStatus(resv._id, "COMPLETED")}
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. STAFF ROSTER TAB */}
        {activeTab === "staff" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Staff & System Roles</h3>
              <button className="btn-primary" onClick={() => setShowAddStaffModal(true)}>
                <Plus size={16} style={{ display: "inline", marginRight: 4 }} /> Add Staff User
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st) => (
                    <tr key={st._id}>
                      <td><strong>{st.name}</strong></td>
                      <td>{st.email}</td>
                      <td>{st.phone}</td>
                      <td><span className="item-badge badge-featured">{st.role}</span></td>
                      <td>
                        <span className={`table-status-pill ${st.isActive !== false ? "table-status-AVAILABLE" : "table-status-OCCUPIED"}`}>
                          {st.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. COUPONS TAB */}
        {activeTab === "coupons" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Promo Coupons</h3>
              <button className="btn-primary" onClick={() => setShowAddCouponModal(true)}>
                <Plus size={16} style={{ display: "inline", marginRight: 4 }} /> Create Coupon
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Cart</th>
                    <th>Max Cap</th>
                    <th>Redemptions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</td>
                      <td>₹{c.minOrderAmount}</td>
                      <td>₹{c.maxDiscountAmount || "N/A"}</td>
                      <td>{c.usedCount || 0} times</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. INVENTORY TAB */}
        {activeTab === "inventory" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Ingredients Stock</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Available Quantity</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Adjust Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((inv) => (
                    <tr key={inv._id}>
                      <td><strong>{inv.name}</strong></td>
                      <td>{inv.quantity} {inv.unit}</td>
                      <td>{inv.minimumThreshold} {inv.unit}</td>
                      <td>
                        <span className={`table-status-pill ${inv.quantity <= inv.minimumThreshold ? "table-status-OCCUPIED" : "table-status-AVAILABLE"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => handleUpdateStock(inv._id, inv.quantity + 10)}
                          >
                            +10 {inv.unit}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => handleUpdateStock(inv._id, Math.max(0, inv.quantity - 10))}
                          >
                            -10 {inv.unit}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Patron Reviews</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Rating</th>
                    <th>Feedback</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev) => (
                    <tr key={rev._id}>
                      <td><strong>{rev.customerName}</strong></td>
                      <td>★ {rev.rating} / 5</td>
                      <td>"{rev.comment}"</td>
                      <td>{new Date(rev.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. RESTAURANT SETTINGS */}
        {activeTab === "settings" && restaurantSettings && (
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <h3>Operating Parameters</h3>
            </div>
            <form onSubmit={handleSaveSettings} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={restaurantSettings.deliveryFee || 40}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, deliveryFee: Number(e.target.value) })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Free Delivery Above (₹)</label>
                <input
                  type="number"
                  value={restaurantSettings.minOrderForFreeDelivery || 500}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, minOrderForFreeDelivery: Number(e.target.value) })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>GST Tax Rate (%)</label>
                <input
                  type="number"
                  value={restaurantSettings.taxRatePercent || 5}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, taxRatePercent: Number(e.target.value) })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Opening Hours</label>
                <input
                  type="text"
                  value={restaurantSettings.openingHours || "12:00 PM - 11:30 PM"}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, openingHours: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* QR Code Modal */}
        {selectedQRTable && (
          <div className="auth-modal-overlay" onClick={() => setSelectedQRTable(null)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="auth-modal-header">
                <h3 style={{ margin: 0, color: "var(--color-gold)" }}>Table {selectedQRTable.tableNumber} QR Code</h3>
                <button className="auth-modal-close" onClick={() => setSelectedQRTable(null)}>✕</button>
              </div>
              <div className="auth-modal-body" style={{ textAlign: "center" }}>
                <div className="qr-code-preview-box">
                  <img src={selectedQRTable.qrDataUrl} alt={`QR Code Table ${selectedQRTable.tableNumber}`} />
                </div>
                <p style={{ fontSize: "0.85rem", color: "#6d5750", margin: "1rem 0" }}>
                  Customers can scan this QR code at Table {selectedQRTable.tableNumber} to open the live menu and place direct orders.
                </p>
                <a
                  href={selectedQRTable.qrDataUrl}
                  download={`Table_${selectedQRTable.tableNumber}_QR.png`}
                  className="btn-primary"
                  style={{ display: "inline-block" }}
                >
                  Download Print Ready QR
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Add Dish Modal */}
        {showAddDishModal && (
          <div className="auth-modal-overlay" onClick={() => setShowAddDishModal(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="auth-modal-header">
                <h3 style={{ margin: 0, color: "var(--color-gold)" }}>Add Royal Dish</h3>
                <button className="auth-modal-close" onClick={() => setShowAddDishModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAddDish} className="auth-modal-body">
                <input
                  type="text"
                  placeholder="Dish Name *"
                  required
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                />
                <select
                  value={newDish.category}
                  onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  {["Biryani", "Mutton", "Chicken", "Veg", "Starters", "Breads", "Extras"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price (₹) *"
                  required
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                />
                <textarea
                  placeholder="Culinary Description"
                  rows={3}
                  value={newDish.description}
                  onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                ></textarea>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={newDish.isVeg}
                    onChange={(e) => setNewDish({ ...newDish, isVeg: e.target.checked })}
                  />
                  <span>Is Pure Vegetarian Dish</span>
                </label>
                <button type="submit" className="btn-primary">Create Dish</button>
              </form>
            </div>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddStaffModal && (
          <div className="auth-modal-overlay" onClick={() => setShowAddStaffModal(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="auth-modal-header">
                <h3 style={{ margin: 0, color: "var(--color-gold)" }}>Add Staff Account</h3>
                <button className="auth-modal-close" onClick={() => setShowAddStaffModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAddStaff} className="auth-modal-body">
                <input
                  type="text"
                  placeholder="Staff Name *"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Staff Email *"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Initial Password *"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                />
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="CHEF">CHEF</option>
                  <option value="WAITER">WAITER</option>
                  <option value="DELIVERY_STAFF">DELIVERY_STAFF</option>
                </select>
                <button type="submit" className="btn-primary">Create Account</button>
              </form>
            </div>
          </div>
        )}

        {/* Add Coupon Modal */}
        {showAddCouponModal && (
          <div className="auth-modal-overlay" onClick={() => setShowAddCouponModal(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="auth-modal-header">
                <h3 style={{ margin: 0, color: "var(--color-gold)" }}>Create Promo Coupon</h3>
                <button className="auth-modal-close" onClick={() => setShowAddCouponModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAddCoupon} className="auth-modal-body">
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. ROYAL25) *"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FIXED">FIXED AMOUNT (₹)</option>
                </select>
                <input
                  type="number"
                  placeholder="Discount Value *"
                  required
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Minimum Order Amount (₹)"
                  value={newCoupon.minOrderAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Maximum Discount Cap (₹)"
                  value={newCoupon.maxDiscountAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(e.target.value) })}
                />
                <button type="submit" className="btn-primary">Save Coupon</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
