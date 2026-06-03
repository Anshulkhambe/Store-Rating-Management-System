const User = require('./User');
const Rating = require('./Rating');
const { sequelize } = require('../config/db');

// A User has many ratings (as a voter)
User.hasMany(Rating, { foreignKey: 'userId', as: 'submittedRatings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A Store (User with role 'store_owner') receives many ratings
User.hasMany(Rating, { foreignKey: 'storeId', as: 'storeRatings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'storeId', as: 'store' });

module.exports = {
  sequelize,
  User,
  Rating
};
