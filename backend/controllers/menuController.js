const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');

// @desc    Get all menu items with search, filter, and sort
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const {
      category,
      search,
      isVeg,
      sort,
      isAvailable,
      isFeatured,
      isPopular,
      spiceLevel,
    } = req.query;

    const query = {};

    // Availability filter (by default returns only available for customers unless specified)
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Dietary filter
    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    // Spice level
    if (spiceLevel) {
      query.spiceLevel = spiceLevel;
    }

    // Featured / Popular
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    if (isPopular === 'true') {
      query.isPopular = true;
    }

    // Search query (case-insensitive name or description)
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { legacyId: 1, createdAt: 1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'name') sortOptions = { name: 1 };
    else if (sort === 'popular') sortOptions = { isPopular: -1, rating: -1 };

    const items = await MenuItem.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuCategory.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({
      success: true,
      categories: categories.map((c) => c.name),
      details: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    let item;
    // Check if valid ObjectId or legacyId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await MenuItem.findById(req.params.id);
    } else {
      item = await MenuItem.findOne({ legacyId: Number(req.params.id) });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item (Admin)
// @route   POST /api/menu
// @access  Private (ADMIN/MANAGER)
const createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item (Admin)
// @route   PUT /api/menu/:id
// @access  Private (ADMIN/MANAGER)
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item availability (Admin/Chef)
// @route   PATCH /api/menu/:id/availability
// @access  Private (ADMIN/MANAGER/CHEF)
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    item.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `Item marked as ${item.isAvailable ? 'Available' : 'Unavailable'}`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item (Admin)
// @route   DELETE /api/menu/:id
// @access  Private (ADMIN)
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      message: 'Menu item removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getCategories,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
};
