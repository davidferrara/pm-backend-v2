const { encodeUser, decodeUser } = require('../models/User');

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


// Returns the row index from a Range.
const convertRangeToRow = (range) => parseInt(range.match(/\d+/));

// Returns the Range from a row index.
const convertRowToRange = (row) => `Users!A${row}:G${row}`;


module.exports = {
  convertToUserObjects,
  convertToUserArrays,
  convertRangeToRow,
  convertRowToRange
};