const { User, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// 1. Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await User.count({ where: { role: 'store_owner' } });
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 2. Admin Creates a User
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Email is already registered' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'user',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        address: newUser.address
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 3. Admin view normal and admin users (sorting & filtering)
exports.getUsers = async (req, res) => {
  try {
    const { search, sortBy, sortOrder, role } = req.query;

    let whereClause = {
      role: {
        [Op.in]: ['admin', 'user']
      }
    };

    if (role && ['admin', 'user'].includes(role)) {
      whereClause.role = role;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [['createdAt', 'DESC']];
    if (sortBy && ['name', 'email', 'address', 'role'].includes(sortBy)) {
      const orderDir = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
      order = [[sortBy, orderDir]];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 4. Admin view stores with their average ratings (sorting & filtering)
exports.getStores = async (req, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;

    let whereClause = {
      role: 'store_owner'
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    // Retrieve stores
    const stores = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] }
    });

    // Compute average ratings manually for maximum SQL server compatibility
    const storesWithRatings = await Promise.all(stores.map(async (store) => {
      const avgRating = await Rating.findOne({
        where: { storeId: store.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']]
      });
      const ratingVal = parseFloat(avgRating.getDataValue('average')) || 0;
      return {
        ...store.toJSON(),
        rating: parseFloat(ratingVal.toFixed(2))
      };
    }));

    // Perform sorting in Javascript
    const orderDir = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
    if (sortBy && ['name', 'email', 'address', 'rating'].includes(sortBy)) {
      storesWithRatings.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return orderDir === 'ASC' ? -1 : 1;
        if (valA > valB) return orderDir === 'ASC' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting by name
      storesWithRatings.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json(storesWithRatings);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 5. Admin view individual user details
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let result = user.toJSON();

    if (user.role === 'store_owner') {
      const avgRating = await Rating.findOne({
        where: { storeId: id },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']]
      });
      result.rating = parseFloat(parseFloat(avgRating.getDataValue('average') || 0).toFixed(2));
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
