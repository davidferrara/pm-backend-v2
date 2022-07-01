const { google } = require('googleapis');
const config = require('./config');
const {
  convertToProductObjects,
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
productSheetService.getAllProducts = async () => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Products'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const products = convertToProductObjects(response);

  return products;
};


// Returns a user or undefined if not found.
productSheetService.findProductById = async (id) => {
  // const { sheets } = await authentication();

  // const searchRequest = {
  //   spreadsheetId,
  //   requestBody: {
  //     dataFilters: [
  //       {
  //         developerMetadataLookup: {
  //           metadataValue: id,
  //         }
  //       }
  //     ]
  //   }
  // };

  // const searchResponse = (await sheets.spreadsheets.developerMetadata.search(searchRequest)).data;
  // if (!searchResponse.matchedDeveloperMetadata) {
  //   logger.info(`user id: ${id} not found.`);
  //   return undefined;
  // }

  // const row = searchResponse.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex;
  // const range = convertRowToRange(row);

  // const getRequest = {
  //   spreadsheetId,
  //   range,
  // };

  // const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data;
  // const values = getResponse.values[0];
  // const user = decodeUser(values);

  // return user;
};


// Returns a user or undefined if not found.
productSheetService.findProductByPostId = async (postId) => {
  // const { sheets } = await authentication();
  // const request = {
  //   spreadsheetId,
  //   range: 'Users'
  // };
  // const response = (await sheets.spreadsheets.values.get(request)).data.values;
  // response.shift(); // Removes the tableheader from the data

  // const users = convertToUserObjects(response);
  // const user = users.find(u => u.username === username);

  // return user;
};


// Returns a user or undefined if not found.
productSheetService.findProductByUser = async (user) => {
  // const { sheets } = await authentication();
  // const request = {
  //   spreadsheetId,
  //   range: 'Users'
  // };
  // const response = (await sheets.spreadsheets.values.get(request)).data.values;
  // response.shift(); // Removes the tableheader from the data

  // const users = convertToUserObjects(response);
  // const user = users.find(u => u.username === username);

  // return user;
};


// Save a new user to the Users sheet.
productSheetService.saveProduct = async (product) => {
  const { sheets } = await authentication();

  product = encodeProduct(product);

  const appendRequest = {
    spreadsheetId,
    range: 'Products',
    valueInputOption: 'RAW',
    includeValuesInResponse: true,
    responseValueRenderOption: 'UNFORMATTED_VALUE',
    resource: {
      values: product
    }
  };

  const appendResponse = (await sheets.spreadsheets.values.append(appendRequest)).data.updates.updatedData;
  const range = appendResponse.range;

  const endIndex = convertRangeToRow(range);
  const startIndex = endIndex - 1;
  logger.info(`startIndex: ${startIndex}\nendIndex: ${endIndex}`);

  const values = appendResponse.values[0];
  const savedProduct = decodeProduct(values);

  const metaDataRequest = {
    spreadsheetId,
    // requestBody must be key:value pairs
    requestBody: {
      requests: [
        {
          createDeveloperMetadata: {
            developerMetadata: {
              metadataKey: 'id',
              metadataValue: savedProduct.id,
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
        },
        {
          createDeveloperMetadata: {
            developerMetadata: {
              metadataKey: 'postId',
              metadataValue: savedProduct.postId,
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
        },
        {
          createDeveloperMetadata: {
            developerMetadata: {
              metadataKey: 'user',
              metadataValue: savedProduct.user,
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
  return savedProduct;
};


// Update a user in the Users sheet.
productSheetService.updateProduct = async (user) => {
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