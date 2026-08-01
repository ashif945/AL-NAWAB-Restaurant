"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./Menu.css";

const MENU_ITEMS = [
  // Biryani
  { id: 1, name: "Hyderabadi Chicken Dum Biryani (Half - 2Pc)", description: "", price: 180, category: "Biryani", isVeg: false },
  { id: 2, name: "Hyderabadi Chicken Dum Biryani (Full - 5Pc)", description: "", price: 360, category: "Biryani", isVeg: false },
  { id: 3, name: "Chicken Biryani Dumpukht (Half - 2Pc)", description: "", price: 180, category: "Biryani", isVeg: false },
  { id: 4, name: "Chicken Biryani Dumpukht (Full - 5Pc)", description: "", price: 360, category: "Biryani", isVeg: false },
  { id: 5, name: "Chicken Lollipop Biryani (Half - 2Pc)", description: "", price: 240, category: "Biryani", isVeg: false },
  { id: 6, name: "Chicken Lollipop Biryani (Full - 5Pc)", description: "", price: 480, category: "Biryani", isVeg: false },
  { id: 7, name: "GYM Biryani Chicken 4 Pc", description: "", price: 220, category: "Biryani", isVeg: false },
  { id: 8, name: "Mutton Biryani Only Sunday (Half - 2Pc)", description: "", price: 290, category: "Biryani", isVeg: false },
  { id: 9, name: "Mutton Biryani Only Sunday (Full - 5Pc)", description: "", price: 560, category: "Biryani", isVeg: false },
  { id: 10, name: "Extra Mutton Piece", description: "", price: 80, category: "Biryani", isVeg: false },
  { id: 11, name: "Extra Chicken Piece", description: "", price: 40, category: "Biryani", isVeg: false },
  { id: 12, name: "Extra Gravy 300ml", description: "", price: 120, category: "Biryani", isVeg: true },
  { id: 13, name: "Extra Gravy 150ml", description: "", price: 60, category: "Biryani", isVeg: true },
  { id: 14, name: "Bondi Raita 300ml", description: "", price: 60, category: "Biryani", isVeg: true },
  { id: 15, name: "Bondi Raita 150ml", description: "", price: 30, category: "Biryani", isVeg: true },

  // Mutton
  { id: 16, name: "Mutton Qorma (Qtr - 2Pc)", description: "", price: 300, category: "Mutton", isVeg: false },
  { id: 17, name: "Mutton Qorma (Half - 4Pc)", description: "", price: 590, category: "Mutton", isVeg: false },
  { id: 18, name: "Mutton Qorma (Full - 8Pc)", description: "", price: 1150, category: "Mutton", isVeg: false },
  { id: 19, name: "Mutton Nihari (Qtr - 2Pc)", description: "", price: 300, category: "Mutton", isVeg: false },
  { id: 20, name: "Mutton Nihari (Half - 4Pc)", description: "", price: 590, category: "Mutton", isVeg: false },
  { id: 21, name: "Mutton Nihari (Full - 8Pc)", description: "", price: 1150, category: "Mutton", isVeg: false },

  // Chicken
  { id: 22, name: "Chicken Qorma (Qtr - 2Pc)", description: "", price: 210, category: "Chicken", isVeg: false },
  { id: 23, name: "Chicken Qorma (Half - 4Pc)", description: "", price: 410, category: "Chicken", isVeg: false },
  { id: 24, name: "Chicken Qorma (Full - 8Pc)", description: "", price: 790, category: "Chicken", isVeg: false },
  { id: 25, name: "Chicken Nihari (Qtr - 2Pc)", description: "", price: 220, category: "Chicken", isVeg: false },
  { id: 26, name: "Chicken Nihari (Half - 4Pc)", description: "", price: 430, category: "Chicken", isVeg: false },
  { id: 27, name: "Chicken Nihari (Full - 8Pc)", description: "", price: 830, category: "Chicken", isVeg: false },
  { id: 28, name: "Chicken Kali mirch (Qtr - 2Pc)", description: "", price: 220, category: "Chicken", isVeg: false },
  { id: 29, name: "Chicken Kali mirch (Half - 4Pc)", description: "", price: 430, category: "Chicken", isVeg: false },
  { id: 30, name: "Chicken Kali mirch (Full - 8Pc)", description: "", price: 830, category: "Chicken", isVeg: false },
  { id: 31, name: "Chicken Chengezi (Qtr - 2Pc)", description: "", price: 250, category: "Chicken", isVeg: false },
  { id: 32, name: "Chicken Chengezi (Half - 4Pc)", description: "", price: 480, category: "Chicken", isVeg: false },
  { id: 33, name: "Chicken Chengezi (Full - 8Pc)", description: "", price: 940, category: "Chicken", isVeg: false },
  { id: 34, name: "Butter Chicken (Qtr - 2Pc)", description: "", price: 250, category: "Chicken", isVeg: false },
  { id: 35, name: "Butter Chicken (Half - 4Pc)", description: "", price: 480, category: "Chicken", isVeg: false },
  { id: 36, name: "Butter Chicken (Full - 8Pc)", description: "", price: 940, category: "Chicken", isVeg: false },
  { id: 37, name: "Kadhai Chicken (Qtr - 2Pc)", description: "", price: 260, category: "Chicken", isVeg: false },
  { id: 38, name: "Kadhai Chicken (Half - 4Pc)", description: "", price: 500, category: "Chicken", isVeg: false },
  { id: 39, name: "Kadhai Chicken (Full - 8Pc)", description: "", price: 990, category: "Chicken", isVeg: false },
  { id: 40, name: "Masala Chicken (Qtr - 2Pc)", description: "", price: 260, category: "Chicken", isVeg: false },
  { id: 41, name: "Masala Chicken (Half - 4Pc)", description: "", price: 500, category: "Chicken", isVeg: false },
  { id: 42, name: "Masala Chicken (Full - 8Pc)", description: "", price: 990, category: "Chicken", isVeg: false },
  { id: 43, name: "Boneless Butter Chicken (Half - 5Pc)", description: "", price: 520, category: "Chicken", isVeg: false },
  { id: 44, name: "Boneless Butter Chicken (Full - 10Pc)", description: "", price: 1020, category: "Chicken", isVeg: false },
  { id: 45, name: "Boneless Kadhai Chicken (Half - 5Pc)", description: "", price: 520, category: "Chicken", isVeg: false },
  { id: 46, name: "Boneless Kadhai Chicken (Full - 10Pc)", description: "", price: 1020, category: "Chicken", isVeg: false },
  { id: 47, name: "Boneless Masala Chicken (Half - 5Pc)", description: "", price: 520, category: "Chicken", isVeg: false },
  { id: 48, name: "Boneless Masala Chicken (Full - 10Pc)", description: "", price: 1020, category: "Chicken", isVeg: false },

  // Veg
  { id: 49, name: "Shahi Paneer (Qtr)", description: "", price: 190, category: "Veg", isVeg: true },
  { id: 50, name: "Shahi Paneer (Half)", description: "", price: 370, category: "Veg", isVeg: true },
  { id: 51, name: "Kadhai Paneer (Qtr)", description: "", price: 210, category: "Veg", isVeg: true },
  { id: 52, name: "Kadhai Paneer (Half)", description: "", price: 410, category: "Veg", isVeg: true },
  { id: 53, name: "Paneer Butter Masala (Qtr)", description: "", price: 210, category: "Veg", isVeg: true },
  { id: 54, name: "Paneer Butter Masala (Half)", description: "", price: 410, category: "Veg", isVeg: true },
  { id: 55, name: "Dal Makhani (Qtr)", description: "", price: 190, category: "Veg", isVeg: true },
  { id: 56, name: "Dal Makhani (Half)", description: "", price: 370, category: "Veg", isVeg: true },
  { id: 57, name: "Dal Fry Tadka (Qtr)", description: "", price: 210, category: "Veg", isVeg: true },
  { id: 58, name: "Dal Fry Tadka (Half)", description: "", price: 400, category: "Veg", isVeg: true },

  // Tandoori & Starters
  { id: 59, name: "Tandoori Chicken (Qtr - 2Pc)", description: "", price: 170, category: "Starters", isVeg: false },
  { id: 60, name: "Tandoori Chicken (Half - 4Pc)", description: "", price: 320, category: "Starters", isVeg: false },
  { id: 61, name: "Tandoori Chicken (Full - 8Pc)", description: "", price: 630, category: "Starters", isVeg: false },
  { id: 62, name: "Tandoori Afghani Chicken Malai (Qtr - 2Pc)", description: "", price: 190, category: "Starters", isVeg: false },
  { id: 63, name: "Tandoori Afghani Chicken Malai (Half - 4Pc)", description: "", price: 360, category: "Starters", isVeg: false },
  { id: 64, name: "Tandoori Afghani Chicken Malai (Full - 8Pc)", description: "", price: 710, category: "Starters", isVeg: false },
  { id: 65, name: "Chicken Lollipop (Qtr - 3Pc)", description: "", price: 150, category: "Starters", isVeg: false },
  { id: 66, name: "Chicken Lollipop (Half - 6Pc)", description: "", price: 300, category: "Starters", isVeg: false },
  { id: 67, name: "Chicken Lollipop (Full - 12Pc)", description: "", price: 580, category: "Starters", isVeg: false },
  { id: 68, name: "Chicken Tikka (Half - 5Pc)", description: "", price: 260, category: "Starters", isVeg: false },
  { id: 69, name: "Chicken Tikka (Full - 10Pc)", description: "", price: 510, category: "Starters", isVeg: false },
  { id: 70, name: "Chicken Malai Tikka (Half - 5Pc)", description: "", price: 300, category: "Starters", isVeg: false },
  { id: 71, name: "Chicken Malai Tikka (Full - 10Pc)", description: "", price: 590, category: "Starters", isVeg: false },
  { id: 72, name: "Paneer Tikka (Half)", description: "", price: 200, category: "Starters", isVeg: true },
  { id: 73, name: "Paneer Tikka (Full)", description: "", price: 400, category: "Starters", isVeg: true },
  { id: 74, name: "Extra Malai", description: "", price: 50, category: "Starters", isVeg: true },
  { id: 75, name: "Chicken Seekh Kebab (Qtr - 2Pc)", description: "", price: 140, category: "Starters", isVeg: false },
  { id: 76, name: "Chicken Seekh Kebab (Half - 4Pc)", description: "", price: 280, category: "Starters", isVeg: false },
  { id: 77, name: "Chicken Seekh Kebab (Full - 8Pc)", description: "", price: 560, category: "Starters", isVeg: false },
  { id: 78, name: "Chicken Malai Seekh Kebab (Qtr - 2Pc)", description: "", price: 160, category: "Starters", isVeg: false },
  { id: 79, name: "Chicken Malai Seekh Kebab (Half - 4Pc)", description: "", price: 310, category: "Starters", isVeg: false },
  { id: 80, name: "Chicken Malai Seekh Kebab (Full - 8Pc)", description: "", price: 610, category: "Starters", isVeg: false },

  // Breads
  { id: 81, name: "Rumali", description: "", price: 15, category: "Breads", isVeg: true },
  { id: 82, name: "Khameeri Roti", description: "", price: 30, category: "Breads", isVeg: true },
  { id: 83, name: "Tandoori Roti", description: "", price: 25, category: "Breads", isVeg: true },
  { id: 84, name: "Lachha Paratha", description: "", price: 50, category: "Breads", isVeg: true },
  { id: 85, name: "Plain Naan", description: "", price: 69, category: "Breads", isVeg: true },
  { id: 86, name: "Butter Naan", description: "", price: 89, category: "Breads", isVeg: true },
  { id: 87, name: "Butter Roti Khameeri", description: "", price: 45, category: "Breads", isVeg: true },

  // Extras (Dessert, Salad, Drink)
  { id: 88, name: "Thandi Kheer", description: "", price: 40, category: "Extras", isVeg: true },
  { id: 89, name: "Kullad Lassi", description: "", price: 60, category: "Extras", isVeg: true },
  { id: 90, name: "Green Salad Small", description: "", price: 50, category: "Extras", isVeg: true },
  { id: 91, name: "Green Salad Medium", description: "", price: 80, category: "Extras", isVeg: true },
  { id: 92, name: "Coldrink", description: "", price: 40, category: "Extras", isVeg: true },
  { id: 93, name: "Diet Coke", description: "", price: 40, category: "Extras", isVeg: true },
  { id: 94, name: "Mineral Water", description: "", price: 20, category: "Extras", isVeg: true }
];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { dispatch } = useCart();

  const categories = ["All", "Biryani", "Mutton", "Chicken", "Veg", "Starters", "Breads", "Extras"];

  const filteredItems = activeCategory === "All" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  const handleAddToCart = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  return (
    <div className="menu-container">
      <div className="menu-categories">
        {categories.map(category => (
          <button 
            key={category} 
            className={`category-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="menu-item-card">
            <div className="menu-item-header">
              <span className={`veg-indicator ${item.isVeg ? 'veg' : 'non-veg'}`}>
                <span></span>
              </span>
              <h3 className="menu-item-name">{item.name}</h3>
            </div>
            <p className="menu-item-desc">{item.description}</p>
            <div className="menu-item-footer">
              <span className="menu-item-price">₹{item.price}</span>
              <button 
                className="btn-primary menu-add-btn"
                onClick={() => handleAddToCart(item)}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
