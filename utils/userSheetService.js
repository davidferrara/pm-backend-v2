const { GoogleSpreadsheet } = require('google-spreadsheet');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const config = require('./config');
const logger = require('./logger');
const { User } = require('../models/User');

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const USER_SHEET_ID = config.USER_SHEET_ID;

const userSheetService = this;
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);


//--------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------

/**
 * authentication
 *
 * Authenticates the service account to use Google sheets API
 */
const authentication = async () => {
  await doc.useServiceAccountAuth({
    client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: config.GOOGLE_PRIVATE_KEY,
  });
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
 * decodeRowUser
 *
 * Takes a GoogleSpreadsheetRow and converts it into a user object.
 *
 * @param {GoogleSpreadsheetRow} rowObject The GoogleSpreadsheetRow to be converted.
 * @returns A user Object.
 */
const decodeRowUser = (rowObject) => {
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
 * decodeQueryUser
 *
 * Takes a query result and converts it into a user object.
 *
 * @param {Array} userValues The GoogleSpreadsheetRow to be converted.
 * @returns A user Object.
 */
const decodeQueryUser = (userValues) => {
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
 * Takes a string 'TRUE' or 'FALSE' and converts it to a boolean type.
 * @param {String} str The string to be converted to a boolean type.
 * @returns true or false.
 */
const convertToBoolean = (str) => {
  const istrueset = (str === 'TRUE');
  return istrueset;
};


//--------------------------------------------------------------------------------
// Service Functions
//--------------------------------------------------------------------------------


/**
 * findUsers
 *
 * Creates a search query for a the Users sheet and returns an array
 * of User objects, undefined, or -1 if there is an error with the
 * search query label.
 *
 * @param {string} searchTerm The term to search for in the User sheet.
 * @param {string} label The label to search through in the User sheet.
 * @returns undefined or an array of User objects or -1 due to unknown label.
 */
userSheetService.findUsers = async (searchTerm, label) => {
  await authentication();

  // Switch statement to determine what column ID (A, B, C...etc)
  // to use in the search query. If the label doesn't match any
  // that are in the sheet, then it will return -1.
  let columnID;
  switch (label) {
    case 'id':
      columnID = 'A';
      break;
    case 'username':
      columnID = 'B';
      break;
    case 'name':
      columnID = 'C';
      break;
    case 'enabled':
      columnID = 'E';
      break;
    case 'privilages':
      columnID = 'F';
      break;
    default:
      logger.info('label not found');
      return -1;
  }

  // Create the query using the columnID and the searchTerm.
  const query = `select * where ${columnID}='${searchTerm}'`;
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${USER_SHEET_ID}&tq=${encodeURI(query)}`;
  const options = {
    method: 'GET',
    headers: { authorization: `Bearer ${doc.jwtClient.credentials.access_token}` }
  };

  // Make a request to the query URL and get the result.
  const queryResult = (await axios.get(url, options)).data;

  // Parse the result into an array of data.
  const parsedResult = parse(queryResult, {});
  parsedResult.shift();

  if (parsedResult.length === 0) {
    return undefined;
  }

  // Convert the parsed result into User objects to return.
  let finalResult = [];
  for (let i = 0; i < parsedResult.length; i++) {
    const user = decodeQueryUser(parsedResult[i]);
    finalResult.push(user);
  }

  return finalResult;
};


/**
 * saveUser
 *
 * Saves a new user to the User sheet.
 *
 * @param {User} user The user object to save to the User sheet.
 * @returns {User} savedUser The user that was saved to the User sheet.
 */
userSheetService.saveUser = async (user) => {
  await authentication();
  await doc.loadInfo();

  const userSheet = doc.sheetsById[USER_SHEET_ID];

  user = encodeUser(user);

  const savedRow = await userSheet.addRow(user, { raw: true, insert: true });

  const savedUser = decodeRowUser(savedRow);
  return savedUser;
};


/**
 * updateUser
 *
 * Updates an existing user on the User sheet.
 *
 * @param {User} user The user object to save to the User sheet.
 * @returns {User} savedUser The user that was saved to the User sheet.
 */
userSheetService.updateUser = async (user) => {
  await authentication();
  await doc.loadInfo();

  const userSheet = doc.sheetsById[USER_SHEET_ID];

  // Get all the rows and find the one with mathcing ID.
  const rows = await userSheet.getRows();
  const index = rows.findIndex(row => row.id === user.id);

  // Change the user object into an array of values.
  user = encodeUser(user);

  // Update all the values.
  rows[index].username = user[1];
  rows[index].name = user[2];
  rows[index].passwordHash = user[3];
  rows[index].enabled = user[4];
  rows[index].privilages = user[5];
  rows[index].products = user[6];

  // Save the row with the new values.
  await rows[index].save({ raw: true });

  const savedUser = decodeRowUser(rows[index]);
  return savedUser;
};

module.exports = userSheetService;