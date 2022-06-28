const UserError = require('../errors/user_error');

function User(id, username, name, passwordHash, enabled, privilages, products) {
  if (typeof id === 'string') {
    this.id = id;
  } else {
    throw new UserError('id is not of type string.');
  }

  if (typeof username === 'string') {
    this.username = username;
  } else {
    throw new UserError('username is not of type string.');
  }

  if (typeof name === 'string') {
    this.name = name;
  } else {
    throw new UserError('name is not of type string.');
  }

  if (typeof passwordHash === 'string') {
    this.passwordHash = passwordHash;
  } else {
    throw new UserError('passwordHash is not of type string.');
  }

  if (typeof enabled === 'boolean') {
    this.enabled = enabled;
  } else {
    throw new UserError('enabled is not of type boolean.');
  }

  if (typeof privilages === 'string') {
    this.privilages = privilages;
  } else {
    throw new UserError('privilages is not of type string.');
  }

  if (Array.isArray(products)) {
    this.products = products;
  } else {
    throw new UserError('products is not an array.');
  }
}

const validateUser = (user) => {
  if (user.username.length < 3) {
    throw new UserError('Username must be at least 3 characters long.');
  }
  if (user.name.length < 2) {
    throw new UserError('Name must be at least 2 characters long.');
  }
  if (Object.keys(user).length > 7) {
    throw new UserError('Too many object keys.');
  }
};

module.exports = {
  User,
  validateUser
};
