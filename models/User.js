const { UserError } = require('../utils/errors');

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
  const usernameRegex = /^[a-zA-Z0-9_]{5,}[a-zA-Z]+[0-9]*$/gi;

  if (user.username.length < 5) {
    throw new UserError('Username must be at least 5 characters long.');
  }

  if (!usernameRegex.test(user.username)) {
    throw new UserError('Username may only contain letters or numbers.');
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
