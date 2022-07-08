const { GoogleSpreadsheet } = require('google-spreadsheet');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const config = require('./config');
const logger = require('./logger');
const { encodeUser, decodeRowUser, decodeQueryUser } = require('../models/User');


const SPREADSHEET_ID = config.SPREADSHEET_ID;
const USER_SHEET_ID = config.USER_SHEET_ID;

const userSheetService = this;

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

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
  const queryResult = await axios.get(url, options);

  // Parse the result into an array of data.
  const parsedResult = parse(queryResult.data, {});
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
 * Saves a new user the the User sheet.
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


// Update a user in the Users sheet.  SINGLE USER
userSheetService.updateUser = async (user) => {
  await authentication();
  await doc.loadInfo();

  
  // const searchRequest = {
  //   spreadsheetId,
  //   requestBody: {
  //     dataFilters: [
  //       {
  //         developerMetadataLookup: {
  //           metadataValue: user.id,
  //         }
  //       }
  //     ]
  //   }
  // };

  // const searchResponse = (await sheets.spreadsheets.developerMetadata.search(searchRequest)).data;
  // if (!searchResponse.matchedDeveloperMetadata) {
  //   logger.info(`user id: ${user.id} not found.`);
  //   return undefined;
  // }

  // const row = searchResponse.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex;
  // const range = convertRowToRange(row, 'Users');

  // // Convert the user object into a 2D array.
  // user = encodeUser(user);

  // // Form the update request
  // const updateRequest = {
  //   spreadsheetId,
  //   range,
  //   valueInputOption: 'RAW',
  //   includeValuesInResponse: true,
  //   responseValueRenderOption: 'UNFORMATTED_VALUE',
  //   resource: {
  //     values: user
  //   }
  // };

  // const updateResponse = (await sheets.spreadsheets.values.update(updateRequest)).data.updatedData;

  // // Get the values from the append response and convert it to a user object.
  // const values = updateResponse.values[0];
  // const savedUser = decodeUser(values);

  // // Return the saved user object.
  return savedUser;
};

module.exports = userSheetService;