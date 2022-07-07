const { GoogleSpreadsheet } = require('google-spreadsheet');
const axios = require('axios');
const csvParse = require('csv-parse');
const config = require('./config');
const logger = require('./logger');
const { User, encodeUser, decodeUser } = require('../models/User');


const SPREADSHEET_ID = config.SPREADSHEET_ID;
const USER_SHEET_ID = config.USER_SHEET_ID;

const userSheetServiceV2 = this;

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

const authentication = async () => {
  await doc.useServiceAccountAuth({
    client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: config.GOOGLE_PRIVATE_KEY,
  });
};


// Returns all users.
userSheetServiceV2.getAllUsers = async () => {
  await authentication();
  await doc.loadInfo();
  const sheet = doc.sheetsById[USER_SHEET_ID]; // the first sheet


  const rows = await sheet.getRows();


  const request = {
    SPREADSHEET_ID,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const users = convertToUserObjects(response);

  return users;
};


// Returns a user or undefined if not found.  MULTIPLE USERS
userSheetServiceV2.findUserByUsername = async (username) => {
  await authentication();
  await doc.loadInfo();
  const query = `select * where B='${username}'`;
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${USER_SHEET_ID}&tq=${encodeURI(query)}`;
  const options = {
    method: 'GET',
    headers: { authorization: `Bearer ${doc.jwtClient.credentials.access_token}` }
  };

  // const response = (await sheets.spreadsheets.values.get(request)).data.values;
  // response.shift(); // Removes the tableheader from the data

  // const users = convertToUserObjects(response);
  // const user = users.find(u => u.username === username);
  const result = await axios.get(url, options);
  console.log(result);
  if (result !== '') csvParse(result, {}, (err, ar) => console.log(ar));

  return undefined;
};


// Returns a user or undefined if not found.  SINGLE USER
userSheetServiceV2.findUserById = async (id) => {
  const { sheets } = await authentication();

  const searchRequest = {
    spreadsheetId,
    requestBody: {
      dataFilters: [
        {
          developerMetadataLookup: {
            metadataValue: id,
          }
        }
      ]
    }
  };

  const searchResponse = (await sheets.spreadsheets.developerMetadata.search(searchRequest)).data;
  if (!searchResponse.matchedDeveloperMetadata) {
    logger.info(`user id: ${id} not found.`);
    return undefined;
  }

  const row = searchResponse.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex;
  const range = convertRowToRange(row, 'Users');

  const getRequest = {
    spreadsheetId,
    range,
  };

  const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data;
  const values = getResponse.values[0];
  const user = decodeUser(values);

  return user;
};


// Save a new user to the Users sheet.  SINGLE USER
userSheetServiceV2.saveUser = async (user) => {
  await authentication();
  await doc.loadInfo();

  const userSheet = doc.sheetsById[USER_SHEET_ID];

  user = encodeUser(user);

  const savedRow = await userSheet.addRow(user, { raw: true, insert: true });

  const savedUser = decodeUser(savedRow);

  return savedUser;
};


// Update a user in the Users sheet.  SINGLE USER
userSheetServiceV2.updateUser = async (user) => {
  const { sheets } = await authentication();

  // User object came with an id so it should exist.
  // Get the Range of the existing User from the sheet.
  const searchRequest = {
    spreadsheetId,
    requestBody: {
      dataFilters: [
        {
          developerMetadataLookup: {
            metadataValue: user.id,
          }
        }
      ]
    }
  };

  const searchResponse = (await sheets.spreadsheets.developerMetadata.search(searchRequest)).data;
  if (!searchResponse.matchedDeveloperMetadata) {
    logger.info(`user id: ${user.id} not found.`);
    return undefined;
  }

  const row = searchResponse.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex;
  const range = convertRowToRange(row, 'Users');

  // Convert the user object into a 2D array.
  user = encodeUser(user);

  // Form the update request
  const updateRequest = {
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    includeValuesInResponse: true,
    responseValueRenderOption: 'UNFORMATTED_VALUE',
    resource: {
      values: user
    }
  };

  const updateResponse = (await sheets.spreadsheets.values.update(updateRequest)).data.updatedData;

  // Get the values from the append response and convert it to a user object.
  const values = updateResponse.values[0];
  const savedUser = decodeUser(values);

  // Return the saved user object.
  return savedUser;
};

module.exports = userSheetServiceV2;