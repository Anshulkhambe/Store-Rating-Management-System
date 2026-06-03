const { User, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');

// 1. Get list of all stores for Normal User, with overall and personal rating details
exports.getStoresForUser = async (req, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;
    const userId = req.user.id;

    let whereClause = {
      role: 'store_owner'
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const stores = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'address', 'email']
    });

    const storesWithRatings = await Promise.all(stores.map(async (store) => {
      const avgRating = await Rating.findOne({
        where: { storeId: store.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']]
      });
      const overallRating = parseFloat(avgRating.getDataValue('average')) || 0;

      const userRatingRecord = await Rating.findOne({
        where: { storeId: store.id, userId }
      });
      const userRating = userRatingRecord ? userRatingRecord.rating : 0;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        email: store.email,
        overallRating: parseFloat(overallRating.toFixed(2)),
        userRating
      };
    }));

    const orderDir = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
    if (sortBy && ['name', 'address', 'overallRating', 'userRating'].includes(sortBy)) {
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
      storesWithRatings.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json(storesWithRatings);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 2. Submit or update rating for a store
exports.submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!storeId || !rating) {
      return res.status(400).json({ error: 'Store ID and rating are required' });
    }

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const store = await User.findOne({ where: { id: storeId, role: 'store_owner' } });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const existingRating = await Rating.findOne({ where: { userId, storeId } });

    if (existingRating) {
      existingRating.rating = ratingVal;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    } else {
      const newRating = await Rating.create({
        userId,
        storeId,
        rating: ratingVal
      });
      return res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 3. Get Store Owner dashboard: average rating and users who submitted ratings
exports.getStoreDashboard = async (req, res) => {
  try {
    const storeId = req.user.id;

    const avgRating = await Rating.findOne({
      where: { storeId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']]
    });
    const overallRating = parseFloat(avgRating.getDataValue('average')) || 0;

    const ratings = await Rating.findAll({
      where: { storeId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'address']
      }],
      order: [['updatedAt', 'DESC']]
    });

    const ratingUsers = ratings.map(r => ({
      ratingId: r.id,
      rating: r.rating,
      date: r.updatedAt,
      userName: r.user ? r.user.name : 'Unknown User',
      userEmail: r.user ? r.user.email : 'N/A',
      userAddress: r.user ? r.user.address : 'N/A'
    }));

    res.json({
      averageRating: parseFloat(overallRating.toFixed(2)),
      ratings: ratingUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
