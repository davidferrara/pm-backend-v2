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


/**
 * encodeUser
 *
 * Takes a userObject and converts it into a 2D array.
 *
 * @param {Object} userObject The user object to be converted.
 * @returns A 2D array containing the userObject's values.
 */
const encodeUser = (userObject) => {
  const result = [Object.values(userObject)];
  result[0][6] = result[0][6].join(',');
  if (result[0][6] === '') {
    result[0][6] = 'none';
  }

  return result;
};


/**
 * decodeUser
 *
 * Takes an array and converts it into an userObject.
 *
 * @param {Array} userValues The user array to be converted.
 * @returns An user Object.
 */
const decodeUser = (userValues) => {
  if (userValues[6] === 'none') {
    userValues[6] = [];
  } else {
    userValues[6] = userValues[6].split(',');
  }

  const result = Object.seal(new User(
    userValues[0],
    userValues[1],
    userValues[2],
    userValues[3],
    convertToBoolean(userValues[4]),
    userValues[5],
    userValues[6]
  ));

  return result;
};


/**
 * convertToBoolean
 *
 * Takes a string 'TRUE' or 'FALSE' and convertes it to a boolean type.
 * @param {String} str The string to be converted to a boolean type.
 * @returns true or false.
 */
const convertToBoolean = (str) => {
  const istrueset = (str === 'TRUE');
  return istrueset;
};


module.exports = {
  User,
  validateUser,
  encodeUser,
  decodeUser
};
