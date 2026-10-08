const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const InventoryItem = require('../models/InventoryItem');

const RAW_MENU_ITEMS = [
  // Biryani
  { id: 1, name: "Hyderabadi Chicken Dum Biryani (Half - 2Pc)", description: "Layered fragrant basmati rice with succulent chicken cooked on slow dum with royal spices.", price: 180, category: "Biryani", isVeg: false, image: "/images/16.jpeg", spiceLevel: "Medium", isPopular: true, isFeatured: true },
  { id: 2, name: "Hyderabadi Chicken Dum Biryani (Full - 5Pc)", description: "Grand family feast of fragrant long-grain rice layered with 5 tender spice-infused chicken pieces.", price: 360, category: "Biryani", isVeg: false, image: "/images/16.jpeg", spiceLevel: "Medium", isPopular: true },
  { id: 3, name: "Chicken Biryani Dumpukht (Half - 2Pc)", description: "Authentic sealed-handi Dumpukht style dum biryani capturing deep Lucknowi aromatics.", price: 180, category: "Biryani", isVeg: false, image: "/images/hero_biryani.png", spiceLevel: "Medium" },
  { id: 4, name: "Chicken Biryani Dumpukht (Full - 5Pc)", description: "Full pot of Awadhi dumpukht biryani enriched with saffron, fried onions, and marinated chicken.", price: 360, category: "Biryani", isVeg: false, image: "/images/hero_biryani.png", spiceLevel: "Medium" },
  { id: 5, name: "Chicken Lollipop Biryani (Half - 2Pc)", description: "Crispy spiced chicken lollipop wings nestled in rich Biryani rice.", price: 240, category: "Biryani", isVeg: false, image: "/images/16.jpeg", spiceLevel: "Spicy" },
  { id: 6, name: "Chicken Lollipop Biryani (Full - 5Pc)", description: "Generous serving of spiced Biryani accompanied by crispy glazed lollipop wings.", price: 480, category: "Biryani", isVeg: false, image: "/images/16.jpeg", spiceLevel: "Spicy" },
  { id: 7, name: "GYM Biryani Chicken 4 Pc", description: "High-protein fitness biryani with extra lean chicken cuts and subtle spices.", price: 220, category: "Biryani", isVeg: false, image: "/images/hero_biryani.png", spiceLevel: "Mild" },
  { id: 8, name: "Mutton Biryani Only Sunday (Half - 2Pc)", description: "Slow-cooked tender baby goat meat simmered in saffron-infused Awadhi basmati rice.", price: 290, category: "Biryani", isVeg: false, image: "/images/feast_platter.png", spiceLevel: "Medium", isFeatured: true },
  { id: 9, name: "Mutton Biryani Only Sunday (Full - 5Pc)", description: "Sunday royal special loaded with melt-in-mouth mutton cuts and rich spices.", price: 560, category: "Biryani", isVeg: false, image: "/images/feast_platter.png", spiceLevel: "Medium", isPopular: true },
  { id: 10, name: "Extra Mutton Piece", description: "Succulent braised mutton piece in rich masala.", price: 80, category: "Biryani", isVeg: false, image: "/images/17.jpeg" },
  { id: 11, name: "Extra Chicken Piece", description: "Tender chicken piece marinated in biryani spices.", price: 40, category: "Biryani", isVeg: false, image: "/images/16.jpeg" },
  { id: 12, name: "Extra Gravy 300ml", description: "Rich, aromatic spiced salan gravy to complement your biryani.", price: 120, category: "Biryani", isVeg: true, image: "/images/17.jpeg" },
  { id: 13, name: "Extra Gravy 150ml", description: "Portion of seasoned Awadhi salan gravy.", price: 60, category: "Biryani", isVeg: true, image: "/images/17.jpeg" },
  { id: 14, name: "Bondi Raita 300ml", description: "Chilled whipped yogurt tempered with crispy boondi and roasted cumin.", price: 60, category: "Biryani", isVeg: true, image: "/images/19.jpeg" },
  { id: 15, name: "Bondi Raita 150ml", description: "Cooling spiced yogurt with crunchy boondi pearls.", price: 30, category: "Biryani", isVeg: true, image: "/images/19.jpeg" },

  // Mutton
  { id: 16, name: "Mutton Qorma (Qtr - 2Pc)", description: "Slow-braised mutton in a rich velvety brown onion and cashew gravy.", price: 300, category: "Mutton", isVeg: false, image: "/images/17.jpeg", isPopular: true },
  { id: 17, name: "Mutton Qorma (Half - 4Pc)", description: "Rich Awadhi mutton qorma cooked in pure desi ghee with royal spices.", price: 590, category: "Mutton", isVeg: false, image: "/images/17.jpeg", isFeatured: true },
  { id: 18, name: "Mutton Qorma (Full - 8Pc)", description: "Royal feast size portion of signature Mutton Qorma.", price: 1150, category: "Mutton", isVeg: false, image: "/images/17.jpeg" },
  { id: 19, name: "Mutton Nihari (Qtr - 2Pc)", description: "Traditional overnight simmered mutton shank stew bursting with deep flavors.", price: 300, category: "Mutton", isVeg: false, image: "/images/17.jpeg", isPopular: true },
  { id: 20, name: "Mutton Nihari (Half - 4Pc)", description: "Melt-in-mouth mutton nihari garnished with fresh ginger slivers and lemon.", price: 590, category: "Mutton", isVeg: false, image: "/images/17.jpeg" },
  { id: 21, name: "Mutton Nihari (Full - 8Pc)", description: "Grand festive portion of Al-Nawab's signature Mutton Nihari.", price: 1150, category: "Mutton", isVeg: false, image: "/images/17.jpeg", isFeatured: true },

  // Chicken
  { id: 22, name: "Chicken Qorma (Qtr - 2Pc)", description: "Classic Lucknowi chicken curry cooked with aromatic spices and brown onion paste.", price: 210, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 23, name: "Chicken Qorma (Half - 4Pc)", description: "Silky, rich chicken qorma best paired with hot khameeri roti.", price: 410, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 24, name: "Chicken Qorma (Full - 8Pc)", description: "Generous family bowl of traditional chicken qorma.", price: 790, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 25, name: "Chicken Nihari (Qtr - 2Pc)", description: "Fragrant, slow-cooked chicken stew simmered with authentic nihari masala.", price: 220, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 26, name: "Chicken Nihari (Half - 4Pc)", description: "Rich chicken nihari stew topped with fresh coriander and green chillies.", price: 430, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 27, name: "Chicken Nihari (Full - 8Pc)", description: "Full bowl of slow-simmered chicken nihari.", price: 830, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 28, name: "Chicken Kali mirch (Qtr - 2Pc)", description: "Tender chicken simmered in a velvety black pepper and cashew cream sauce.", price: 220, category: "Chicken", isVeg: false, image: "/images/19.jpeg", isPopular: true },
  { id: 29, name: "Chicken Kali mirch (Half - 4Pc)", description: "Mildly pungent, creamy black pepper chicken delicacy.", price: 430, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 30, name: "Chicken Kali mirch (Full - 8Pc)", description: "Large bowl of signature Chicken Kali Mirch.", price: 830, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 31, name: "Chicken Chengezi (Qtr - 2Pc)", description: "Tangy, tomato-rich Delhi-style roasted chicken in a luscious gravy.", price: 250, category: "Chicken", isVeg: false, image: "/images/17.jpeg", isPopular: true },
  { id: 32, name: "Chicken Chengezi (Half - 4Pc)", description: "Spiced chargrilled chicken pieces tossed in butter and yoghurt gravy.", price: 480, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 33, name: "Chicken Chengezi (Full - 8Pc)", description: "Signature Mughlai Chicken Chengezi platter.", price: 940, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 34, name: "Butter Chicken (Qtr - 2Pc)", description: "Tandoori chicken pieces simmered in smooth, buttery tomato and cream gravy.", price: 250, category: "Chicken", isVeg: false, image: "/images/19.jpeg", isPopular: true, isFeatured: true },
  { id: 35, name: "Butter Chicken (Half - 4Pc)", description: "Rich, mildly sweet and savory classic Butter Chicken.", price: 480, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 36, name: "Butter Chicken (Full - 8Pc)", description: "Full family portion of rich creamy Butter Chicken.", price: 940, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 37, name: "Kadhai Chicken (Qtr - 2Pc)", description: "Chicken wok-tossed with bell peppers, onions, and freshly ground kadhai spices.", price: 260, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 38, name: "Kadhai Chicken (Half - 4Pc)", description: "Semi-dry spicy kadhai chicken with crushed coriander seeds.", price: 500, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 39, name: "Kadhai Chicken (Full - 8Pc)", description: "Full portion of aromatic Kadhai Chicken.", price: 990, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 40, name: "Masala Chicken (Qtr - 2Pc)", description: "Bold and spicy chicken cooked in robust home-style masala gravy.", price: 260, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 41, name: "Masala Chicken (Half - 4Pc)", description: "Spiced chicken curry with deep caramelized onion undertones.", price: 500, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 42, name: "Masala Chicken (Full - 8Pc)", description: "Grand portion of spicy Masala Chicken.", price: 990, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 43, name: "Boneless Butter Chicken (Half - 5Pc)", description: "Succulent boneless chicken tikka cooked in buttery makhani gravy.", price: 520, category: "Chicken", isVeg: false, image: "/images/19.jpeg", isPopular: true },
  { id: 44, name: "Boneless Butter Chicken (Full - 10Pc)", description: "10 pieces of tender boneless tandoori chicken in satin butter sauce.", price: 1020, category: "Chicken", isVeg: false, image: "/images/19.jpeg" },
  { id: 45, name: "Boneless Kadhai Chicken (Half - 5Pc)", description: "Boneless chicken morsels stir-fried with capsicum and fresh ground spices.", price: 520, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 46, name: "Boneless Kadhai Chicken (Full - 10Pc)", description: "Platter of boneless kadhai chicken with crunchy peppers.", price: 1020, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 47, name: "Boneless Masala Chicken (Half - 5Pc)", description: "Juicy boneless chicken simmered in spicy masala reduction.", price: 520, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },
  { id: 48, name: "Boneless Masala Chicken (Full - 10Pc)", description: "Full portion of fiery boneless masala chicken.", price: 1020, category: "Chicken", isVeg: false, image: "/images/17.jpeg" },

  // Veg
  { id: 49, name: "Shahi Paneer (Qtr)", description: "Fresh cottage cheese cubes simmered in royal cashew and saffron gravy.", price: 190, category: "Veg", isVeg: true, image: "/images/19.jpeg", isPopular: true },
  { id: 50, name: "Shahi Paneer (Half)", description: "Mild and creamy royal paneer preparation.", price: 370, category: "Veg", isVeg: true, image: "/images/19.jpeg" },
  { id: 51, name: "Kadhai Paneer (Qtr)", description: "Paneer cubes tossed with crisp capsicum, onions, and spicy kadhai masala.", price: 210, category: "Veg", isVeg: true, image: "/images/17.jpeg" },
  { id: 52, name: "Kadhai Paneer (Half)", description: "Fragrant wok-tossed cottage cheese with coriander and whole red chillies.", price: 410, category: "Veg", isVeg: true, image: "/images/17.jpeg" },
  { id: 53, name: "Paneer Butter Masala (Qtr)", description: "Soft paneer in rich tomato-butter sauce garnished with fresh cream.", price: 210, category: "Veg", isVeg: true, image: "/images/19.jpeg", isFeatured: true },
  { id: 54, name: "Paneer Butter Masala (Half)", description: "Classic crowd-pleaser paneer in velvety makhani gravy.", price: 410, category: "Veg", isVeg: true, image: "/images/19.jpeg" },
  { id: 55, name: "Dal Makhani (Qtr)", description: "Black lentils slow-cooked overnight with churned butter and cream.", price: 190, category: "Veg", isVeg: true, image: "/images/17.jpeg", isPopular: true },
  { id: 56, name: "Dal Makhani (Half)", description: "Authentic slow-simmered creamy Dal Makhani.", price: 370, category: "Veg", isVeg: true, image: "/images/17.jpeg" },
  { id: 57, name: "Dal Fry Tadka (Qtr)", description: "Yellow lentils tempered with cumin, garlic, tomatoes, and pure ghee.", price: 210, category: "Veg", isVeg: true, image: "/images/17.jpeg" },
  { id: 58, name: "Dal Fry Tadka (Half)", description: "Homestyle aromatic garlic-cumin tempered yellow dal.", price: 400, category: "Veg", isVeg: true, image: "/images/17.jpeg" },

  // Tandoori & Starters
  { id: 59, name: "Tandoori Chicken (Qtr - 2Pc)", description: "Chicken marinated in mustard oil, hung curd, and spices, roasted in clay oven.", price: 170, category: "Starters", isVeg: false, image: "/images/13.jpeg", isPopular: true },
  { id: 60, name: "Tandoori Chicken (Half - 4Pc)", description: "Classic char-grilled tandoori chicken served with mint chutney.", price: 320, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 61, name: "Tandoori Chicken (Full - 8Pc)", description: "Whole clay-oven roasted chicken with signature tandoori spices.", price: 630, category: "Starters", isVeg: false, image: "/images/13.jpeg", isFeatured: true },
  { id: 62, name: "Tandoori Afghani Chicken Malai (Qtr - 2Pc)", description: "Tender chicken marinated in cashew cream, cheese, and cardamom.", price: 190, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 63, name: "Tandoori Afghani Chicken Malai (Half - 4Pc)", description: "Silky, melt-in-mouth mild grilled chicken kebabs.", price: 360, category: "Starters", isVeg: false, image: "/images/13.jpeg", isPopular: true },
  { id: 64, name: "Tandoori Afghani Chicken Malai (Full - 8Pc)", description: "Grand platter of creamy Afghani Malai chicken.", price: 710, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 65, name: "Chicken Lollipop (Qtr - 3Pc)", description: "Crispy fried frenched chicken wings seasoned with oriental spices.", price: 150, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 66, name: "Chicken Lollipop (Half - 6Pc)", description: "Golden crispy chicken lollipops with dipping sauce.", price: 300, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 67, name: "Chicken Lollipop (Full - 12Pc)", description: "Party pack of 12 crispy succulent chicken lollipops.", price: 580, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 68, name: "Chicken Tikka (Half - 5Pc)", description: "Boneless chicken chunks steeped in spicy red marinade and skewered over coals.", price: 260, category: "Starters", isVeg: false, image: "/images/13.jpeg", isPopular: true },
  { id: 69, name: "Chicken Tikka (Full - 10Pc)", description: "10 pieces of smoky char-grilled Chicken Tikka.", price: 510, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 70, name: "Chicken Malai Tikka (Half - 5Pc)", description: "Boneless chicken steeped in rich cream, cheese, and roasted to tenderness.", price: 300, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 71, name: "Chicken Malai Tikka (Full - 10Pc)", description: "10 pieces of velvety mild Chicken Malai Tikka.", price: 590, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 72, name: "Paneer Tikka (Half)", description: "Marinated cubes of cottage cheese, capsicum, and onions grilled on skewers.", price: 200, category: "Starters", isVeg: true, image: "/images/13.jpeg" },
  { id: 73, name: "Paneer Tikka (Full)", description: "Generous portion of charcoal-grilled spicy Paneer Tikka.", price: 400, category: "Starters", isVeg: true, image: "/images/13.jpeg" },
  { id: 74, name: "Extra Malai", description: "Rich fresh cream dip topping.", price: 50, category: "Starters", isVeg: true, image: "/images/19.jpeg" },
  { id: 75, name: "Chicken Seekh Kebab (Qtr - 2Pc)", description: "Minced spiced chicken skewers charcoal-grilled to perfection.", price: 140, category: "Starters", isVeg: false, image: "/images/13.jpeg", isPopular: true },
  { id: 76, name: "Chicken Seekh Kebab (Half - 4Pc)", description: "Juicy chicken seekh kebabs served with onion rings and lemon.", price: 280, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 77, name: "Chicken Seekh Kebab (Full - 8Pc)", description: "Platter of 8 tender char-grilled chicken seekh kebabs.", price: 560, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 78, name: "Chicken Malai Seekh Kebab (Qtr - 2Pc)", description: "Minced chicken blended with cream and cheese, grilled on skewers.", price: 160, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 79, name: "Chicken Malai Seekh Kebab (Half - 4Pc)", description: "Melt-in-mouth creamy chicken seekh kebabs.", price: 310, category: "Starters", isVeg: false, image: "/images/13.jpeg" },
  { id: 80, name: "Chicken Malai Seekh Kebab (Full - 8Pc)", description: "Full portion of 8 rich Chicken Malai Seekh Kebabs.", price: 610, category: "Starters", isVeg: false, image: "/images/13.jpeg" },

  // Breads
  { id: 81, name: "Rumali", description: "Ultra-thin, soft handkerchief bread tossed on an inverted tawa.", price: 15, category: "Breads", isVeg: true, image: "/images/17.jpeg", isPopular: true },
  { id: 82, name: "Khameeri Roti", description: "Traditional Mughal fermented fluffy leavened bread baked in tandoor.", price: 30, category: "Breads", isVeg: true, image: "/images/17.jpeg", isPopular: true },
  { id: 83, name: "Tandoori Roti", description: "Crisp whole wheat bread baked in traditional clay oven.", price: 25, category: "Breads", isVeg: true, image: "/images/17.jpeg" },
  { id: 84, name: "Lachha Paratha", description: "Layered, flaky crispy whole wheat bread brushed with ghee.", price: 50, category: "Breads", isVeg: true, image: "/images/17.jpeg" },
  { id: 85, name: "Plain Naan", description: "Soft, pillowy leavened flatbread freshly baked in tandoor.", price: 69, category: "Breads", isVeg: true, image: "/images/19.jpeg" },
  { id: 86, name: "Butter Naan", description: "Hot, fluffy naan brushed generously with melted butter.", price: 89, category: "Breads", isVeg: true, image: "/images/19.jpeg", isPopular: true },
  { id: 87, name: "Butter Roti Khameeri", description: "Warm khameeri roti topped with rich butter.", price: 45, category: "Breads", isVeg: true, image: "/images/17.jpeg" },

  // Extras
  { id: 88, name: "Thandi Kheer", description: "Slow-cooked royal rice pudding infused with saffron, cardamom, and dry fruits.", price: 40, category: "Extras", isVeg: true, image: "/images/19.jpeg", isPopular: true, isFeatured: true },
  { id: 89, name: "Kullad Lassi", description: "Thick, creamy yogurt drink served chilled in traditional clay kullad.", price: 60, category: "Extras", isVeg: true, image: "/images/19.jpeg", isPopular: true },
  { id: 90, name: "Green Salad Small", description: "Fresh sliced cucumbers, carrots, onions, tomatoes, and green chillies.", price: 50, category: "Extras", isVeg: true, image: "/images/13.jpeg" },
  { id: 91, name: "Green Salad Medium", description: "Medium portion of fresh crisp garden salad with lemon wedges.", price: 80, category: "Extras", isVeg: true, image: "/images/13.jpeg" },
  { id: 92, name: "Coldrink", description: "Chilled carbonated soft beverage 300ml.", price: 40, category: "Extras", isVeg: true, image: "/images/1.jpeg" },
  { id: 93, name: "Diet Coke", description: "Zero sugar refreshing cola can.", price: 40, category: "Extras", isVeg: true, image: "/images/1.jpeg" },
  { id: 94, name: "Mineral Water", description: "Packaged 1L purified drinking water.", price: 20, category: "Extras", isVeg: true, image: "/images/1.jpeg" }
];

const CATEGORIES_DATA = [
  { name: "Biryani", slug: "biryani", displayOrder: 1, description: "Royal Awadhi & Hyderabadi Dum Biryanis" },
  { name: "Mutton", slug: "mutton", displayOrder: 2, description: "Rich slow-cooked Mutton Qormas and Niharis" },
  { name: "Chicken", slug: "chicken", displayOrder: 3, description: "Signature Chicken curries, Chengezi & Butter Chicken" },
  { name: "Veg", slug: "veg", displayOrder: 4, description: "Paneer specialties and creamy Dal Makhani" },
  { name: "Starters", slug: "starters", displayOrder: 5, description: "Char-grilled Tandoori, Malai Tikkas & Seekh Kebabs" },
  { name: "Breads", slug: "breads", displayOrder: 6, description: "Rumali, Khameeri, Butter Naan & Lachha Paratha" },
  { name: "Extras", slug: "extras", displayOrder: 7, description: "Thandi Kheer, Kullad Lassi, Salads & Drinks" },
];

const DEFAULT_USERS = [
  {
    name: 'Al-Nawab Administrator',
    email: 'admin@alnawab.com',
    password: 'Admin@12345',
    phone: '08505969388',
    role: 'ADMIN',
    loyaltyPoints: 1000,
  },
  {
    name: 'General Manager',
    email: 'manager@alnawab.com',
    password: 'Manager@123',
    phone: '08505969389',
    role: 'MANAGER',
    loyaltyPoints: 500,
  },
  {
    name: 'Head Chef Ustad',
    email: 'chef@alnawab.com',
    password: 'Chef@123',
    phone: '08505969390',
    role: 'CHEF',
  },
  {
    name: 'Floor Captain Waiter',
    email: 'waiter@alnawab.com',
    password: 'Waiter@123',
    phone: '08505969391',
    role: 'WAITER',
  },
  {
    name: 'Delivery Executive',
    email: 'delivery@alnawab.com',
    password: 'Delivery@123',
    phone: '08505969392',
    role: 'DELIVERY_STAFF',
  },
  {
    name: 'Rahul Sharma',
    email: 'customer@alnawab.com',
    password: 'Customer@123',
    phone: '9876543210',
    role: 'CUSTOMER',
    loyaltyPoints: 150,
    addresses: [
      {
        street: 'Flat 402, Royal Palms, Sector 104',
        landmark: 'Near Pathways School',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201304',
        isDefault: true,
      },
    ],
  },
];

const DEFAULT_TABLES = [
  { tableNumber: 'T-01', capacity: 2, section: 'Main Hall', status: 'AVAILABLE' },
  { tableNumber: 'T-02', capacity: 4, section: 'Main Hall', status: 'AVAILABLE' },
  { tableNumber: 'T-03', capacity: 4, section: 'Main Hall', status: 'AVAILABLE' },
  { tableNumber: 'T-04', capacity: 6, section: 'Royal Family Nook', status: 'AVAILABLE' },
  { tableNumber: 'T-05', capacity: 8, section: 'Royal Family Nook', status: 'AVAILABLE' },
  { tableNumber: 'T-06', capacity: 6, section: 'Floor Seating Dastarkhwan', status: 'AVAILABLE' },
  { tableNumber: 'T-07', capacity: 8, section: 'Floor Seating Dastarkhwan', status: 'AVAILABLE' },
  { tableNumber: 'T-08', capacity: 4, section: 'Outdoor Courtyard', status: 'AVAILABLE' },
  { tableNumber: 'T-09', capacity: 4, section: 'Outdoor Courtyard', status: 'AVAILABLE' },
  { tableNumber: 'T-10', capacity: 12, section: 'Private Dining', status: 'AVAILABLE' },
];

const DEFAULT_COUPONS = [
  {
    code: 'ROYAL10',
    description: '10% instant discount on all orders',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 300,
    maxDiscountAmount: 200,
    validUntil: new Date('2030-12-31'),
    isActive: true,
  },
  {
    code: 'NAWAB50',
    description: 'Flat ₹50 off on orders above ₹400',
    discountType: 'FIXED',
    discountValue: 50,
    minOrderAmount: 400,
    maxDiscountAmount: 50,
    validUntil: new Date('2030-12-31'),
    isActive: true,
  },
  {
    code: 'FEAST20',
    description: '20% off on Grand Royal Feast orders above ₹800',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 800,
    maxDiscountAmount: 400,
    validUntil: new Date('2030-12-31'),
    isActive: true,
  },
];

const DEFAULT_REVIEWS = [
  {
    customerName: 'Rahul S.',
    rating: 5,
    comment: 'The best Biryani in Noida, hands down! The meat was tender and the flavors were absolutely royal.',
    isApproved: true,
  },
  {
    customerName: 'Priya M.',
    rating: 5,
    comment: 'Booked a table for my parents\' anniversary. The hospitality was exceptional, and the Galouti Kebabs melted in our mouths.',
    isApproved: true,
  },
  {
    customerName: 'Vikram K.',
    rating: 5,
    comment: 'Authentic Awadhi taste. The family pack was massive and easily fed our group of 6. Highly recommend!',
    isApproved: true,
  },
  {
    customerName: 'Ayesha Khan',
    rating: 5,
    comment: 'The Mutton Nihari and Khameeri Roti tasted straight out of Purani Dilli. Truly exceptional ambiance!',
    isApproved: true,
  },
];

const DEFAULT_INVENTORY = [
  { name: 'Basmati Rice (Aged)', quantity: 150, unit: 'kg', minimumThreshold: 30, costPerUnit: 120 },
  { name: 'Fresh Mutton Cuts', quantity: 45, unit: 'kg', minimumThreshold: 15, costPerUnit: 650 },
  { name: 'Farm Fresh Chicken', quantity: 80, unit: 'kg', minimumThreshold: 20, costPerUnit: 220 },
  { name: 'Fresh Malai Paneer', quantity: 25, unit: 'kg', minimumThreshold: 8, costPerUnit: 340 },
  { name: 'Pure Desi Ghee', quantity: 30, unit: 'kg', minimumThreshold: 10, costPerUnit: 680 },
  { name: 'Awadhi Whole Spices & Saffron', quantity: 15, unit: 'kg', minimumThreshold: 5, costPerUnit: 1200 },
  { name: 'Rumali Atta / Dough', quantity: 50, unit: 'kg', minimumThreshold: 15, costPerUnit: 45 },
  { name: 'Tandoor Natural Charcoal', quantity: 100, unit: 'kg', minimumThreshold: 25, costPerUnit: 60 },
];

const seedDatabase = async () => {
  try {
    // 1. Restaurant Info
    const existingRestaurant = await Restaurant.findOne();
    if (!existingRestaurant) {
      await Restaurant.create({});
      console.log('[Seed] Default Restaurant profile created.');
    }

    // 2. Categories
    const categoryCount = await MenuCategory.countDocuments();
    if (categoryCount === 0) {
      await MenuCategory.insertMany(CATEGORIES_DATA);
      console.log('[Seed] Menu categories seeded.');
    }

    // 3. Menu Items
    const itemCount = await MenuItem.countDocuments();
    if (itemCount === 0) {
      const itemsToInsert = RAW_MENU_ITEMS.map((item) => ({
        legacyId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isVeg: item.isVeg,
        image: item.image,
        spiceLevel: item.spiceLevel || 'Medium',
        isPopular: item.isPopular || false,
        isFeatured: item.isFeatured || false,
        isAvailable: true,
        rating: 4.8,
        reviewCount: Math.floor(Math.random() * 20) + 10,
        preparationTime: item.category === 'Biryani' ? 25 : item.category === 'Breads' ? 10 : 20,
      }));
      await MenuItem.insertMany(itemsToInsert);
      console.log(`[Seed] ${itemsToInsert.length} Menu items seeded successfully.`);
    }

    // 4. Default Users
    for (const userData of DEFAULT_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
      }
    }
    console.log('[Seed] Users & Staff accounts verified/seeded.');

    // 5. Tables
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      await Table.insertMany(DEFAULT_TABLES);
      console.log('[Seed] Restaurant tables seeded.');
    }

    // 6. Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany(DEFAULT_COUPONS);
      console.log('[Seed] Promotional coupons seeded.');
    }

    // 7. Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany(DEFAULT_REVIEWS);
      console.log('[Seed] Reviews seeded.');
    }

    // 8. Inventory
    const invCount = await InventoryItem.countDocuments();
    if (invCount === 0) {
      await InventoryItem.insertMany(DEFAULT_INVENTORY);
      console.log('[Seed] Initial inventory stock seeded.');
    }

    console.log('[Seed] Database seeding completed successfully.');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

module.exports = { seedDatabase, RAW_MENU_ITEMS };
