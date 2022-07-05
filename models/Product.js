const { ProductError } = require('../utils/errors');

function Product(id, postId, client, reason, condition, conditionNotes, asin, expirationDate, quantity, location, dateCreated, dateModified, masterSku, user) {
  if (typeof id === 'string') {
    this.id = id;
  } else {
    throw new ProductError('id is not of type string.');
  }

  if (typeof postId === 'string') {
    this.postId = postId;
  } else {
    throw new ProductError('postId is not of type string.');
  }

  if (typeof client === 'string') {
    this.client = client;
  } else {
    throw new ProductError('client is not of type string.');
  }

  if (typeof reason === 'string') {
    this.reason = reason;
  } else {
    throw new ProductError('reason is not of type string.');
  }

  if (typeof condition === 'string') {
    this.condition = condition;
  } else {
    throw new ProductError('condition is not of type string.');
  }

  if (typeof conditionNotes === 'string') {
    this.conditionNotes = conditionNotes;
  } else {
    throw new ProductError('conditionNotes is not of type string.');
  }

  if (typeof asin === 'string') {
    this.asin = asin;
  } else {
    throw new ProductError('asin is not of type string.');
  }

  if (typeof expirationDate === 'string') {
    this.expirationDate = expirationDate;
  } else {
    throw new ProductError('expirationDate is not of type string.');
  }

  if (typeof quantity === 'number') {
    this.quantity = quantity;
  } else {
    throw new ProductError('quantity is not of type number.');
  }

  if (typeof location === 'string') {
    this.location = location;
  } else {
    throw new ProductError('location is not of type string.');
  }

  if (typeof dateCreated === 'string') {
    this.dateCreated = dateCreated;
  } else {
    throw new ProductError('dateCreated is not of type string.');
  }

  if (typeof dateModified === 'string') {
    this.dateModified = dateModified;
  } else {
    throw new ProductError('dateModified is not of type string.');
  }

  if (typeof masterSku === 'string') {
    this.masterSku = masterSku;
  } else {
    throw new ProductError('masterSku is not of type string.');
  }

  if (typeof user === 'string') {
    this.user = user;
  } else {
    throw new ProductError('user is not of type string.');
  }
}


const validateProduct = (product) => {
  if (product.location.length < 2) {
    throw new ProductError('location must be at least 2 characters long.');
  }

  if (product.user === '') {
    throw new ProductError('User must exist.');
  }

  if (Object.keys(product).length > 14) {
    throw new ProductError('Too many object keys.');
  }
};


/**
 * encodeProduct
 *
 * Takes a productObject and converts it into a 2D array.
 *
 * @param {Object} productObject The product object to be converted.
 * @returns A 2D array containing the productObject's values.
 */
const encodeProduct = (productObject) => {
  const result = [Object.values(productObject)];

  return result;
};


/**
 * decodeUser
 *
 * Takes an array and converts it into productValues.
 *
 * @param {Array} productValues The product array to be converted.
 * @returns An product Object.
 */
const decodeProduct = (productValues) => {
  const result = Object.seal(new Product(
    productValues[0],
    productValues[1],
    productValues[2],
    productValues[3],
    productValues[4],
    productValues[5],
    productValues[6],
    productValues[7],
    Number(productValues[8]),
    productValues[9],
    productValues[10],
    productValues[11],
    productValues[12],
    productValues[13]
  ));

  return result;
};


module.exports = {
  Product,
  validateProduct,
  encodeProduct,
  decodeProduct
};
