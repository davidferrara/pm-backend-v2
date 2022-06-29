const ObjectID = require('bson').ObjectID;
const { google } = require('googleapis');
const config = require('./config');
const {
  convertToUserObjects,
  convertToUserArrays,
  convertRangeToRow,
  convertRowToRange,
} = require('../utils/converter');
const { encodeUser, decodeUser } = require('../models/User');
const logger = require('./logger');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = config.SPREADSHEET_ID;
const userSheetId = config.USER_SHEET_ID;
const userSheetService = this;


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
userSheetService.getAllUsers = async () => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const users = convertToUserObjects(response);

  return users;
};


// Returns a user or undefined if not found.
userSheetService.findUserByUsername = async (username) => {
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
userSheetService.findUserById = async (id) => {
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
  const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data.values;

  const users = convertToUserObjects(getResponse);
  const user = users[0];
  return user;
};


userSheetService.findUserByIdAndUpdate = async (id, userChanges) => {
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
  const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data.values;

  const users = convertToUserObjects(getResponse);
  const user = users[0];
  return user;
};


userSheetService.saveUser = async (user) => {
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
                  sheetId: userSheetId,
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

// Save to the user sheet.
userSheetService.updateUser = async (user) => {
  const { sheets } = await authentication();

  // Check to see if this is a new user or an existing one to be saved.
  if (user.id) {
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

    // Validate the user object.
    validateUser(user);

    // Convert the user object into a 2D array.
    user = convertToUserArrays([user]);

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
    console.log(updateResponse.values);

    // Get the values from the append response and convert it to a user object.
    const values = updateResponse.values;
    const savedUser = convertToUserObjects(values);

    // Return the saved user object.
    return savedUser;
  }

  // User object did not come with an id so it doesn't exist.
  // Create an id for the new user.
  const id = new ObjectID();
  user.id = id.toString();

  // Validate the user object.
  validateUser(user);

  // Convert the user object into a 2D array.
  user = convertToUserArrays([user]);

  // Form the append request.
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

  // Get the range from the append response.
  const appendResponse = (await sheets.spreadsheets.values.append(appendRequest)).data.updates.updatedData;
  const range = appendResponse.range;

  // Extract the row indec from the range and set the metaData request indexes.
  const endIndex = convertRangeToRow(range);
  const startIndex = endIndex - 1;
  logger.info(`startIndex: ${startIndex}\nendIndex: ${endIndex}`);

  // Get the values from the append response and convert it to a user object.
  const values = appendResponse.values;
  const savedUser = convertToUserObjects(values);

  // Form the metaData request to create an id lookup for the row.
  const metaDataRequest = {
    spreadsheetId,
    requestBody: {
      requests: [
        {
          createDeveloperMetadata: {
            developerMetadata: {
              metadataKey: 'id',
              metadataValue: id,
              location: {
                dimensionRange: {
                  sheetId: userSheetId,
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

  // Send the create metaData request.
  await sheets.spreadsheets.batchUpdate(metaDataRequest);

  // Return the saved user object.
  return savedUser;
};

module.exports = userSheetService;