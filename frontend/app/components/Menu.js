"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../context/CartContext";
import { menuService } from "../services/menuService";
import { Search, Flame, Check, Sparkles, Utensils } from "lucide-react";
import "./Menu.css";

const FALLBACK_MENU_ITEMS = [
  // Biryani
  { id: 1, name: "Hyderabadi Chicken Dum Biryani (Half - 2Pc)", description: "Layered fragrant basmati rice with succulent chicken cooked on slow dum with royal spices.", price: 180, category: "Biryani", isVeg: false, isPopular: true, spiceLevel: "Medium" },
  { id: 2, name: "Hyderabadi Chicken Dum Biryani (Full - 5Pc)", description: "Grand family feast of fragrant long-grain rice layered with 5 tender spice-infused chicken pieces.", price: 360, category: "Biryani", isVeg: false, isPopular: true },
  { id: 3, name: "Chicken Biryani Dumpukht (Half - 2Pc)", description: "Authentic sealed-handi Dumpukht style dum biryani capturing deep Lucknowi aromatics.", price: 180, category: "Biryani", isVeg: false },
  { id: 4, name: "Chicken Biryani Dumpukht (Full - 5Pc)", description: "Full pot of Awadhi dumpukht biryani enriched with saffron, fried onions, and marinated chicken.", price: 360, category: "Biryani", isVeg: false },
  { id: 5, name: "Chicken Lollipop Biryani (Half - 2Pc)", description: "Crispy spiced chicken lollipop wings nestled in rich Biryani rice.", price: 240, category: "Biryani", isVeg: false, spiceLevel: "Spicy" },
  { id: 6, name: "Chicken Lollipop Biryani (Full - 5Pc)", description: "Generous serving of spiced Biryani accompanied by crispy glazed lollipop wings.", price: 480, category: "Biryani", isVeg: false, spiceLevel: "Spicy" },
  { id: 7, name: "GYM Biryani Chicken 4 Pc", description: "High-protein fitness biryani with extra lean chicken cuts and subtle spices.", price: 220, category: "Biryani", isVeg: false },
  { id: 8, name: "Mutton Biryani Only Sunday (Half - 2Pc)", description: "Slow-cooked tender baby goat meat simmered in saffron-infused Awadhi basmati rice.", price: 290, category: "Biryani", isVeg: false, isFeatured: true },
  { id: 9, name: "Mutton Biryani Only Sunday (Full - 5Pc)", description: "Sunday royal special loaded with melt-in-mouth mutton cuts and rich spices.", price: 560, category: "Biryani", isVeg: false, isPopular: true },
  { id: 10, name: "Extra Mutton Piece", description: "Succulent braised mutton piece in rich masala.", price: 80, category: "Biryani", isVeg: false },
  { id: 11, name: "Extra Chicken Piece", description: "Tender chicken piece marinated in biryani spices.", price: 40, category: "Biryani", isVeg: false },
  { id: 12, name: "Extra Gravy 300ml", description: "Rich, aromatic spiced salan gravy to complement your biryani.", price: 120, category: "Biryani", isVeg: true },
  { id: 13, name: "Extra Gravy 150ml", description: "Portion of seasoned Awadhi salan gravy.", price: 60, category: "Biryani", isVeg: true },
  { id: 14, name: "Bondi Raita 300ml", description: "Chilled whipped yogurt tempered with crispy boondi and roasted cumin.", price: 60, category: "Biryani", isVeg: true },
  { id: 15, name: "Bondi Raita 150ml", description: "Cooling spiced yogurt with crunchy boondi pearls.", price: 30, category: "Biryani", isVeg: true },

  // Mutton
  { id: 16, name: "Mutton Qorma (Qtr - 2Pc)", description: "Slow-braised mutton in a rich velvety brown onion and cashew gravy.", price: 300, category: "Mutton", isVeg: false, isPopular: true },
  { id: 17, name: "Mutton Qorma (Half - 4Pc)", description: "Rich Awadhi mutton qorma cooked in pure desi ghee with royal spices.", price: 590, category: "Mutton", isVeg: false, isFeatured: true },
  { id: 18, name: "Mutton Qorma (Full - 8Pc)", description: "Royal feast size portion of signature Mutton Qorma.", price: 1150, category: "Mutton", isVeg: false },
  { id: 19, name: "Mutton Nihari (Qtr - 2Pc)", description: "Traditional overnight simmered mutton shank stew bursting with deep flavors.", price: 300, category: "Mutton", isVeg: false, isPopular: true },
  { id: 20, name: "Mutton Nihari (Half - 4Pc)", description: "Melt-in-mouth mutton nihari garnished with fresh ginger slivers and lemon.", price: 590, category: "Mutton", isVeg: false },
  { id: 21, name: "Mutton Nihari (Full - 8Pc)", description: "Grand festive portion of Al-Nawab's signature Mutton Nihari.", price: 1150, category: "Mutton", isVeg: false, isFeatured: true },

  // Chicken
  { id: 22, name: "Chicken Qorma (Qtr - 2Pc)", description: "Classic Lucknowi chicken curry cooked with aromatic spices and brown onion paste.", price: 210, category: "Chicken", isVeg: false },
  { id: 23, name: "Chicken Qorma (Half - 4Pc)", description: "Silky, rich chicken qorma best paired with hot khameeri roti.", price: 410, category: "Chicken", isVeg: false },
  { id: 24, name: "Chicken Qorma (Full - 8Pc)", description: "Generous family bowl of traditional chicken qorma.", price: 790, category: "Chicken", isVeg: false },
  { id: 25, name: "Chicken Nihari (Qtr - 2Pc)", description: "Fragrant, slow-cooked chicken stew simmered with authentic nihari masala.", price: 220, category: "Chicken", isVeg: false },
  { id: 26, name: "Chicken Nihari (Half - 4Pc)", description: "Rich chicken nihari stew topped with fresh coriander and green chillies.", price: 430, category: "Chicken", isVeg: false },
  { id: 27, name: "Chicken Nihari (Full - 8Pc)", description: "Full bowl of slow-simmered chicken nihari.", price: 830, category: "Chicken", isVeg: false },
  { id: 28, name: "Chicken Kali mirch (Qtr - 2Pc)", description: "Tender chicken simmered in a velvety black pepper and cashew cream sauce.", price: 220, category: "Chicken", isVeg: false, isPopular: true },
  { id: 29, name: "Chicken Kali mirch (Half - 4Pc)", description: "Mildly pungent, creamy black pepper chicken delicacy.", price: 430, category: "Chicken", isVeg: false },
  { id: 30, name: "Chicken Kali mirch (Full - 8Pc)", description: "Large bowl of signature Chicken Kali Mirch.", price: 830, category: "Chicken", isVeg: false },
  { id: 31, name: "Chicken Chengezi (Qtr - 2Pc)", description: "Tangy, tomato-rich Delhi-style roasted chicken in a luscious gravy.", price: 250, category: "Chicken", isVeg: false, isPopular: true },
  { id: 32, name: "Chicken Chengezi (Half - 4Pc)", description: "Spiced chargrilled chicken pieces tossed in butter and yoghurt gravy.", price: 480, category: "Chicken", isVeg: false },
  { id: 33, name: "Chicken Chengezi (Full - 8Pc)", description: "Signature Mughlai Chicken Chengezi platter.", price: 940, category: "Chicken", isVeg: false },
  { id: 34, name: "Butter Chicken (Qtr - 2Pc)", description: "Tandoori chicken pieces simmered in smooth, buttery tomato and cream gravy.", price: 250, category: "Chicken", isVeg: false, isPopular: true, isFeatured: true },
  { id: 35, name: "Butter Chicken (Half - 4Pc)", description: "Rich, mildly sweet and savory classic Butter Chicken.", price: 480, category: "Chicken", isVeg: false },
  { id: 36, name: "Butter Chicken (Full - 8Pc)", description: "Full family portion of rich creamy Butter Chicken.", price: 940, category: "Chicken", isVeg: false },
  { id: 37, name: "Kadhai Chicken (Qtr - 2Pc)", description: "Chicken wok-tossed with bell peppers, onions, and freshly ground kadhai spices.", price: 260, category: "Chicken", isVeg: false },
  { id: 38, name: "Kadhai Chicken (Half - 4Pc)", description: "Semi-dry spicy kadhai chicken with crushed coriander seeds.", price: 500, category: "Chicken", isVeg: false },
  { id: 39, name: "Kadhai Chicken (Full - 8Pc)", description: "Full portion of aromatic Kadhai Chicken.", price: 990, category: "Chicken", isVeg: false },
  { id: 40, name: "Masala Chicken (Qtr - 2Pc)", description: "Bold and spicy chicken cooked in robust home-style masala gravy.", price: 260, category: "Chicken", isVeg: false },
  { id: 41, name: "Masala Chicken (Half - 4Pc)", description: "Spiced chicken curry with deep caramelized onion undertones.", price: 500, category: "Chicken", isVeg: false },
  { id: 42, name: "Masala Chicken (Full - 8Pc)", description: "Grand portion of spicy Masala Chicken.", price: 990, category: "Chicken", isVeg: false },
  { id: 43, name: "Boneless Butter Chicken (Half - 5Pc)", description: "Succulent boneless chicken tikka cooked in buttery makhani gravy.", price: 520, category: "Chicken", isVeg: false, isPopular: true },
  { id: 44, name: "Boneless Butter Chicken (Full - 10Pc)", description: "10 pieces of tender boneless tandoori chicken in satin butter sauce.", price: 1020, category: "Chicken", isVeg: false },
  { id: 45, name: "Boneless Kadhai Chicken (Half - 5Pc)", description: "Boneless chicken morsels stir-fried with capsicum and fresh ground spices.", price: 520, category: "Chicken", isVeg: false },
  { id: 46, name: "Boneless Kadhai Chicken (Full - 10Pc)", description: "Platter of boneless kadhai chicken with crunchy peppers.", price: 1020, category: "Chicken", isVeg: false },
  { id: 47, name: "Boneless Masala Chicken (Half - 5Pc)", description: "Juicy boneless chicken simmered in spicy masala reduction.", price: 520, category: "Chicken", isVeg: false },
  { id: 48, name: "Boneless Masala Chicken (Full - 10Pc)", description: "Full portion of fiery boneless masala chicken.", price: 1020, category: "Chicken", isVeg: false },

  // Veg
  { id: 49, name: "Shahi Paneer (Qtr)", description: "Fresh cottage cheese cubes simmered in royal cashew and saffron gravy.", price: 190, category: "Veg", isVeg: true, isPopular: true },
  { id: 50, name: "Shahi Paneer (Half)", description: "Mild and creamy royal paneer preparation.", price: 370, category: "Veg", isVeg: true },
  { id: 51, name: "Kadhai Paneer (Qtr)", description: "Paneer cubes tossed with crisp capsicum, onions, and spicy kadhai masala.", price: 210, category: "Veg", isVeg: true },
  { id: 52, name: "Kadhai Paneer (Half)", description: "Fragrant wok-tossed cottage cheese with coriander and whole red chillies.", price: 410, category: "Veg", isVeg: true },
  { id: 53, name: "Paneer Butter Masala (Qtr)", description: "Soft paneer in rich tomato-butter sauce garnished with fresh cream.", price: 210, category: "Veg", isVeg: true, isFeatured: true },
  { id: 54, name: "Paneer Butter Masala (Half)", description: "Classic crowd-pleaser paneer in velvety makhani gravy.", price: 410, category: "Veg", isVeg: true },
  { id: 55, name: "Dal Makhani (Qtr)", description: "Black lentils slow-cooked overnight with churned butter and cream.", price: 190, category: "Veg", isVeg: true, isPopular: true },
  { id: 56, name: "Dal Makhani (Half)", description: "Authentic slow-simmered creamy Dal Makhani.", price: 370, category: "Veg", isVeg: true },
  { id: 57, name: "Dal Fry Tadka (Qtr)", description: "Yellow lentils tempered with cumin, garlic, tomatoes, and pure ghee.", price: 210, category: "Veg", isVeg: true },
  { id: 58, name: "Dal Fry Tadka (Half)", description: "Homestyle aromatic garlic-cumin tempered yellow dal.", price: 400, category: "Veg", isVeg: true },

  // Tandoori & Starters
  { id: 59, name: "Tandoori Chicken (Qtr - 2Pc)", description: "Chicken marinated in mustard oil, hung curd, and spices, roasted in clay oven.", price: 170, category: "Starters", isVeg: false, isPopular: true },
  { id: 60, name: "Tandoori Chicken (Half - 4Pc)", description: "Classic char-grilled tandoori chicken served with mint chutney.", price: 320, category: "Starters", isVeg: false },
  { id: 61, name: "Tandoori Chicken (Full - 8Pc)", description: "Whole clay-oven roasted chicken with signature tandoori spices.", price: 630, category: "Starters", isVeg: false, isFeatured: true },
  { id: 62, name: "Tandoori Afghani Chicken Malai (Qtr - 2Pc)", description: "Tender chicken marinated in cashew cream, cheese, and cardamom.", price: 190, category: "Starters", isVeg: false },
  { id: 63, name: "Tandoori Afghani Chicken Malai (Half - 4Pc)", description: "Silky, melt-in-mouth mild grilled chicken kebabs.", price: 360, category: "Starters", isVeg: false, isPopular: true },
  { id: 64, name: "Tandoori Afghani Chicken Malai (Full - 8Pc)", description: "Grand platter of creamy Afghani Malai chicken.", price: 710, category: "Starters", isVeg: false },
  { id: 65, name: "Chicken Lollipop (Qtr - 3Pc)", description: "Crispy fried frenched chicken wings seasoned with oriental spices.", price: 150, category: "Starters", isVeg: false },
  { id: 66, name: "Chicken Lollipop (Half - 6Pc)", description: "Golden crispy chicken lollipops with dipping sauce.", price: 300, category: "Starters", isVeg: false },
  { id: 67, name: "Chicken Lollipop (Full - 12Pc)", description: "Party pack of 12 crispy succulent chicken lollipops.", price: 580, category: "Starters", isVeg: false },
  { id: 68, name: "Chicken Tikka (Half - 5Pc)", description: "Boneless chicken chunks steeped in spicy red marinade and skewered over coals.", price: 260, category: "Starters", isVeg: false, isPopular: true },
  { id: 69, name: "Chicken Tikka (Full - 10Pc)", description: "10 pieces of smoky char-grilled Chicken Tikka.", price: 510, category: "Starters", isVeg: false },
  { id: 70, name: "Chicken Malai Tikka (Half - 5Pc)", description: "Boneless chicken steeped in rich cream, cheese, and roasted to tenderness.", price: 300, category: "Starters", isVeg: false },
  { id: 71, name: "Chicken Malai Tikka (Full - 10Pc)", description: "10 pieces of velvety mild Chicken Malai Tikka.", price: 590, category: "Starters", isVeg: false },
  { id: 72, name: "Paneer Tikka (Half)", description: "Marinated cubes of cottage cheese, capsicum, and onions grilled on skewers.", price: 200, category: "Starters", isVeg: true },
  { id: 73, name: "Paneer Tikka (Full)", description: "Generous portion of charcoal-grilled spicy Paneer Tikka.", price: 400, category: "Starters", isVeg: true },
  { id: 74, name: "Extra Malai", description: "Rich fresh cream dip topping.", price: 50, category: "Starters", isVeg: true },
  { id: 75, name: "Chicken Seekh Kebab (Qtr - 2Pc)", description: "Minced spiced chicken skewers charcoal-grilled to perfection.", price: 140, category: "Starters", isVeg: false, isPopular: true },
  { id: 76, name: "Chicken Seekh Kebab (Half - 4Pc)", description: "Juicy chicken seekh kebabs served with onion rings and lemon.", price: 280, category: "Starters", isVeg: false },
  { id: 77, name: "Chicken Seekh Kebab (Full - 8Pc)", description: "Platter of 8 tender char-grilled chicken seekh kebabs.", price: 560, category: "Starters", isVeg: false },
  { id: 78, name: "Chicken Malai Seekh Kebab (Qtr - 2Pc)", description: "Minced chicken blended with cream and cheese, grilled on skewers.", price: 160, category: "Starters", isVeg: false },
  { id: 79, name: "Chicken Malai Seekh Kebab (Half - 4Pc)", description: "Melt-in-mouth creamy chicken seekh kebabs.", price: 310, category: "Starters", isVeg: false },
  { id: 80, name: "Chicken Malai Seekh Kebab (Full - 8Pc)", description: "Full portion of 8 rich Chicken Malai Seekh Kebabs.", price: 610, category: "Starters", isVeg: false },

  // Breads
  { id: 81, name: "Rumali", description: "Ultra-thin, soft handkerchief bread tossed on an inverted tawa.", price: 15, category: "Breads", isVeg: true, isPopular: true },
  { id: 82, name: "Khameeri Roti", description: "Traditional Mughal fermented fluffy leavened bread baked in tandoor.", price: 30, category: "Breads", isVeg: true, isPopular: true },
  { id: 83, name: "Tandoori Roti", description: "Crisp whole wheat bread baked in traditional clay oven.", price: 25, category: "Breads", isVeg: true },
  { id: 84, name: "Lachha Paratha", description: "Layered, flaky crispy whole wheat bread brushed with ghee.", price: 50, category: "Breads", isVeg: true },
  { id: 85, name: "Plain Naan", description: "Soft, pillowy leavened flatbread freshly baked in tandoor.", price: 69, category: "Breads", isVeg: true },
  { id: 86, name: "Butter Naan", description: "Hot, fluffy naan brushed generously with melted butter.", price: 89, category: "Breads", isVeg: true, isPopular: true },
  { id: 87, name: "Butter Roti Khameeri", description: "Warm khameeri roti topped with rich butter.", price: 45, category: "Breads", isVeg: true },

  // Extras
  { id: 88, name: "Thandi Kheer", description: "Slow-cooked royal rice pudding infused with saffron, cardamom, and dry fruits.", price: 40, category: "Extras", isVeg: true, isPopular: true, isFeatured: true },
  { id: 89, name: "Kullad Lassi", description: "Thick, creamy yogurt drink served chilled in traditional clay kullad.", price: 60, category: "Extras", isVeg: true, isPopular: true },
  { id: 90, name: "Green Salad Small", description: "Fresh sliced cucumbers, carrots, onions, tomatoes, and green chillies.", price: 50, category: "Extras", isVeg: true },
  { id: 91, name: "Green Salad Medium", description: "Medium portion of fresh crisp garden salad with lemon wedges.", price: 80, category: "Extras", isVeg: true },
  { id: 92, name: "Coldrink", description: "Chilled carbonated soft beverage 300ml.", price: 40, category: "Extras", isVeg: true },
  { id: 93, name: "Diet Coke", description: "Zero sugar refreshing cola can.", price: 40, category: "Extras", isVeg: true },
  { id: 94, name: "Mineral Water", description: "Packaged 1L purified drinking water.", price: 20, category: "Extras", isVeg: true }
];

export default function Menu() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState("ALL"); // ALL, VEG, NON_VEG
  const [menuItems, setMenuItems] = useState(FALLBACK_MENU_ITEMS);
  const [categories, setCategories] = useState([
    "All",
    "Biryani",
    "Mutton",
    "Chicken",
    "Veg",
    "Starters",
    "Breads",
    "Extras",
  ]);
  const [loading, setLoading] = useState(true);
  const [addedItemEffect, setAddedItemEffect] = useState(null);

  const { dispatch, cart } = useCart();

  // If table parameter is present in URL, configure cart for Dine-In
  useEffect(() => {
    if (tableParam) {
      dispatch({ type: "SET_TABLE_NUMBER", payload: tableParam });
    }
  }, [tableParam, dispatch]);

  // Fetch menu from live API
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await menuService.getMenuItems();
        if (res.success && res.items && res.items.length > 0) {
          setMenuItems(res.items);
        }
      } catch (err) {
        console.warn("Using offline fallback menu items:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filter items based on Category, Search, and Dietary preferences
  const filteredItems = menuItems.filter((item) => {
    // Category match
    const matchesCategory =
      activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();

    // Search match
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Dietary match
    const matchesDietary =
      dietaryFilter === "ALL" ||
      (dietaryFilter === "VEG" && item.isVeg) ||
      (dietaryFilter === "NON_VEG" && !item.isVeg);

    return matchesCategory && matchesSearch && matchesDietary;
  });

  const handleAddToCart = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    setAddedItemEffect(item._id || item.id);
    setTimeout(() => setAddedItemEffect(null), 1200);
  };

  return (
    <div className="menu-container">
      {cart.tableNumber && (
        <div className="table-dinein-banner">
          <div>
            <h3>🛎️ Table {cart.tableNumber} Dine-In Service</h3>
            <p>Your order will be served directly to your designated royal table.</p>
          </div>
          <span className="filter-pill active">Dine-In Active</span>
        </div>
      )}

      {/* Search & Dietary Filters */}
      <div className="menu-search-filter-bar">
        <div className="menu-search-box">
          <Search className="menu-search-icon" size={18} />
          <input
            type="text"
            className="menu-search-input"
            placeholder="Search royal biryanis, qormas, breads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="menu-dietary-filters">
          <button
            className={`filter-pill ${dietaryFilter === "ALL" ? "active" : ""}`}
            onClick={() => setDietaryFilter("ALL")}
          >
            All Dishes
          </button>
          <button
            className={`filter-pill ${dietaryFilter === "VEG" ? "active" : ""}`}
            onClick={() => setDietaryFilter("VEG")}
          >
            <span className="veg-indicator veg" style={{ width: 12, height: 12, marginTop: 0 }}>
              <span style={{ width: 6, height: 6 }}></span>
            </span>
            Pure Veg
          </button>
          <button
            className={`filter-pill ${dietaryFilter === "NON_VEG" ? "active" : ""}`}
            onClick={() => setDietaryFilter("NON_VEG")}
          >
            <span className="veg-indicator non-veg" style={{ width: 12, height: 12, marginTop: 0 }}>
              <span style={{ width: 6, height: 6 }}></span>
            </span>
            Non-Veg
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="menu-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-menu-state">
            <Utensils size={48} style={{ opacity: 0.4, marginBottom: "1rem" }} />
            <h3>No dishes found</h3>
            <p>Try refining your search term or selecting another category.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isAdded = (item._id || item.id) === addedItemEffect;
            const isAvailable = item.isAvailable !== false;

            return (
              <div key={item._id || item.id} className="menu-item-card">
                <div className="menu-item-header">
                  <span className={`veg-indicator ${item.isVeg ? "veg" : "non-veg"}`}>
                    <span></span>
                  </span>
                  <h3 className="menu-item-name">{item.name}</h3>
                </div>

                <div className="menu-item-tags">
                  {item.isPopular && <span className="item-badge badge-popular">★ Popular</span>}
                  {item.isFeatured && <span className="item-badge badge-featured">✦ Royal Special</span>}
                  {item.spiceLevel && item.spiceLevel !== "Mild" && (
                    <span className="item-badge badge-spice">🌶 {item.spiceLevel}</span>
                  )}
                </div>

                <p className="menu-item-desc">{item.description}</p>

                <div className="menu-item-footer">
                  <span className="menu-item-price">₹{item.price}</span>
                  {isAvailable ? (
                    <button
                      className="btn-primary menu-add-btn"
                      onClick={() => handleAddToCart(item)}
                      style={isAdded ? { backgroundColor: "var(--color-emerald)" } : {}}
                    >
                      {isAdded ? "✓ Added" : "Add"}
                    </button>
                  ) : (
                    <span className="sold-out-badge">Sold Out</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
