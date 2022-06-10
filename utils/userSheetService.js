const ObjectID = require('bson').ObjectID;
const { google } = require('googleapis');
const config = require('./config');
const {
  convertToUserObjects,
  convertToUserArrays
} = require('../models/User');
const { validateUser } = require('./validation');
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

// Returns the row index from a Range.
const getRow = (range) => parseInt(range.match(/\d+/));


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

  const request = {
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

  const response = await sheets.spreadsheets.developerMetadata.search(request);
  console.log(response.data.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange);
  
};


userSheetService.findUserByIdAndUpdate = async (id, userChanges) => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const users = convertToUserObjects(response);
  const user = users.find(u => u.id === id);

  validateUser(userChanges);
  user = convertToUserArrays([user]);

  // const request = {
  //   spreadsheetId,
  //   range: 'Users',
  //   valueInputOption: 'RAW',
  //   includeValuesInResponse: true,
  //   responseValueRenderOption: 'UNFORMATTED_VALUE',
  //   resource: {
  //     values: user
  //   }
  // };

  // // const response = (await sheets.spreadsheets.values.append(request)).data.updates.updatedData.values;
  // const savedUser = convertToUserObject(response);
  return savedUser;
};

userSheetService.saveNewUser = async (user) => {
  const { sheets } = await authentication();

  const id = new ObjectID();
  user.id = id.toString();

  validateUser(user);
  user = convertToUserArrays([user]);

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

  const endIndex = getRow(range);
  const startIndex = endIndex - 1;
  logger.info(`startIndex: ${startIndex}\nendIndex: ${endIndex}`);

  const values = appendResponse.values;
  const savedUser = convertToUserObjects(values);

  const metaDataRequest = {
    spreadsheetId,
    // requestBody must be key:value pairs
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

  await sheets.spreadsheets.batchUpdate(metaDataRequest);
  return savedUser;
};

module.exports = userSheetService;