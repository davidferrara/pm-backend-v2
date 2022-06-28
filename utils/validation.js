const UserError = require('../errors/user_error');
// const ProductError = require('../errors/product_error');

// Takes a user object
const validateUser = (user) => {
  if(user.username.length < 3) {
    throw new UserError('Username must be at least 3 characters long.');
  }
  if(user.name.length < 2) {
    throw new UserError('Name must be at least 2 characters long.');
  }
  if(Object.keys(user).length > 7) {
    throw new UserError('Too many object keys.');
  }
};

// const validateProduct = (product) => {

// };

module.exports = {
  validateUser,
  // validateProduct
};