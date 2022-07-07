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
 * Takes a user object and converts it into an array.
 *
 * @param {Object} userObject The user object to be converted.
 * @returns An array containing the userObject's values.
 */
const encodeUser = (userObject) => {
  const result = Object.values(userObject);
  result[6] = result[6].join(',');
  if (result[6] === '') {
    result[6] = 'none';
  }

  return result;
};


/**
 * decodeUser
 *
 * Takes a GoogleSpreadsheetRow and converts it into a user object.
 *
 * @param {GoogleSpreadsheetRow} rowObject The GoogleSpreadsheetRow to be converted.
 * @returns A user Object.
 */
const decodeUser = (rowObject) => {
  if (rowObject.products === 'none') {
    rowObject.products = [];
  } else {
    rowObject.products = rowObject.products.split(',');
  }

  const result = Object.seal(new User(
    rowObject.id,
    rowObject.username,
    rowObject.name,
    rowObject.passwordHash,
    convertToBoolean(rowObject.enabled),
    rowObject.privilages,
    rowObject.products
  ));

  return result;
};


/**
 * convertToBoolean
 *
 * Takes a string 'TRUE' or 'FALSE' and converts it to a boolean type.
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
