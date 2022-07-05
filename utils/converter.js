const { encodeUser, decodeUser } = require('../models/User');
const { encodeProduct, decodeProduct } = require('../models/Product');

//Takes array of arrays
const convertToUserArrays = (array) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    const user = encodeUser(array[i]);
    result.push(user);
  }

  return result;
};


//Takes array of arrays
const convertToUserObjects = (array) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    const user = decodeUser(array[i]);
    result.push(user);
  }

  return result;
};

//Takes array of arrays
const convertToProductArrays = (array) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    const product = encodeProduct(array[i]);
    result.push(product);
  }

  return result;
};


//Takes array of arrays
const convertToProductObjects = (array) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    const product = decodeProduct(array[i]);
    result.push(product);
  }

  return result;
};


// Returns the row index from a Range.
const convertRangeToRow = (range) => parseInt(range.match(/\d+/));

// Returns the Range from a row index.
const convertRowToRange = (row, sheetName) => {
  if (sheetName === 'Users') {
    return `Users!A${row}:G${row}`;
  }
  if (sheetName === 'Products') {
    return `Products!A${row}:N${row}`;
  }
};


module.exports = {
  convertToUserObjects,
  convertToUserArrays,
  convertToProductArrays,
  convertToProductObjects,
  convertRangeToRow,
  convertRowToRange
};