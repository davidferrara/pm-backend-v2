const userKeys = [
  'id',
  'username',
  'name',
  'passwordHash',
  'enabled',
  'privilages',
  'products'
];

//Takes array of arrays
const convertToUserObject = (array) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    const user = {};
    for (let j = 0; j < userKeys.length; j++) {
      user[userKeys[j]] = array[i][j];
    }
    result.push(user);
  }

  return result;
};

//Takes array of arrays
const convertToUserArray = (array) => {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    const user = Object.values(array[i]);
    result.push(user);
  }

  return result;
};

module.exports = {
  convertToUserObject,
  convertToUserArray
};