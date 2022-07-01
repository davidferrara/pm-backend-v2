const { google } = require('googleapis');
const config = require('./config');
const {
  convertToUserObjects,
  convertRangeToRow,
  convertRowToRange,
} = require('../utils/converter');
const { encodeProduct, decodeProduct } = require('../models/Product');
const logger = require('./logger');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = config.SPREADSHEET_ID;
const productSheetId = config.PRODUCT_SHEET_ID;
const productSheetService = this;


const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({
    version: 'v4',
    auth: authClient
  });

  return { sheets };
};


// Returns all users.
productSheetService.getAllUsers = async () => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Products'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const products = convertToUserObjects(response);

  return products;
};


// Returns a user or undefined if not found.
productSheetService.findUserByUsername = async (username) => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data

  const users = convertToUserObjects(response);
  const user = users.find(u => u.username === username);

  return user;
};


// Returns a user or undefined if not found.
productSheetService.findUserById = async (id) => {
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
  const range = convertRowToRange(row);

  const getRequest = {
    spreadsheetId,
    range,
  };

  const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data;
  const values = getResponse.values[0];
  const user = decodeUser(values);

  return user;
};


// Save a new user to the Users sheet.
productSheetService.saveUser = async (user) => {
  const { sheets } = await authentication();

  user = encodeUser(user);
  console.log('After encoding in userSheetService...', user);

  const appendRequest = {
    spreadsheetId,
    range: 'Users',
    valueInputOption: 'RAW',
    includeValuesInResponse: true,
    responseValueRenderOption: 'UNFORMATTED_VALUE',
    resource: {
      values: user
    }
  };

  const appendResponse = (await sheets.spreadsheets.values.append(appendRequest)).data.updates.updatedData;
  const range = appendResponse.range;

  const endIndex = convertRangeToRow(range);
  const startIndex = endIndex - 1;
  logger.info(`startIndex: ${startIndex}\nendIndex: ${endIndex}`);

  const values = appendResponse.values[0];
  const savedUser = decodeUser(values);

  const metaDataRequest = {
    spreadsheetId,
    // requestBody must be key:value pairs
    requestBody: {
      requests: [
        {
          createDeveloperMetadata: {
            developerMetadata: {
              metadataKey: 'id',
              metadataValue: savedUser.id,
              location: {
                dimensionRange: {
                  sheetId: productSheetId,
                  dimension: 'ROWS',
                  startIndex,
                  endIndex,
                }
              },
              visibility: 'DOCUMENT',
            }
          }
        }
      ]
    },
  };

  await sheets.spreadsheets.batchUpdate(metaDataRequest);
  return savedUser;
};


// Update a user in the Users sheet.
productSheetService.updateUser = async (user) => {
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
  const range = convertRowToRange(row);

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

module.exports = productSheetService;