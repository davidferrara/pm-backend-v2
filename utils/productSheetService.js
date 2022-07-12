const { GoogleSpreadsheet } = require('google-spreadsheet');
const config = require('./config');
const { Product } = require('../models/Product');
const logger = require('./logger');

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const PRODUCT_SHEET_ID = config.PRODUCT_SHEET_ID;
const productSheetService = this;

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

  await doc.loadInfo();
};

/**
 * encodeProduct
 *
 * Takes a productObject and converts it into a 2D array.
 *
 * @param {Object} productObject The product object to be converted.
 * @returns A 2D array containing the productObject's values.
 */
const encodeProduct = (productObject) => {
  const result = [Object.values(productObject)];

  return result;
};


/**
 * decodeProduct
 *
 * Takes an array and converts it into productValues.
 *
 * @param {Array} productValues The product array to be converted.
 * @returns An product Object.
 */
const decodeProduct = (productValues) => {
  const result = Object.seal(new Product(
    productValues[0],
    productValues[1],
    productValues[2],
    productValues[3],
    productValues[4],
    productValues[5],
    productValues[6],
    productValues[7],
    Number(productValues[8]),
    productValues[9],
    productValues[10],
    productValues[11],
    productValues[12],
    productValues[13]
  ));

  return result;
};


productSheetService.test = async () => {
  await authentication();

  const productSheet = await doc.sheetsById[PRODUCT_SHEET_ID];

  const rows = await productSheet.getRows();
  console.log(rows.length);

  const newProduct = Object.seal(new Product(
    'ABCDEF',
    '0123345',
    'ANJ',
    'Barred Limitation',
    'New',
    '',
    'B07BS87FSG3',
    '',
    6,
    'IDK',
    'Yesterday',  // Date Created
    'Today',  // Date Modified
    '',
    'ME LOL'
  ));

  const newRow = await productSheet.addRow(newProduct);


  return newRow;
};


// Returns a user or undefined if not found.  SINGLE PRODUCT
productSheetService.findProductById = async (id) => {
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
    logger.info(`product id: ${id} not found.`);
    return undefined;
  }

  const row = searchResponse.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex;
  const range = convertRowToRange(row, 'Products');

  const getRequest = {
    spreadsheetId,
    range,
  };

  const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data;
  const values = getResponse.values[0];
  const product = decodeProduct(values);

  return product;
};


// Returns a user or undefined if not found.  SINGLE PRODUCT
productSheetService.findProductByPostId = async (postId) => {
  const { sheets } = await authentication();

  const searchRequest = {
    spreadsheetId,
    requestBody: {
      dataFilters: [
        {
          developerMetadataLookup: {
            metadataValue: postId,
          }
        }
      ]
    }
  };

  const searchResponse = (await sheets.spreadsheets.developerMetadata.search(searchRequest)).data;
  if (!searchResponse.matchedDeveloperMetadata) {
    logger.info(`product postId: ${postId} not found.`);
    return undefined;
  }

  const row = searchResponse.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex;
  const range = convertRowToRange(row, 'Products');

  const getRequest = {
    spreadsheetId,
    range,
  };

  const getResponse = (await sheets.spreadsheets.values.get(getRequest)).data;
  const values = getResponse.values[0];
  const product = decodeProduct(values);

  return product;
};


// Returns products or undefined if not found.  MULTIPLE PRODUCTS
productSheetService.findProductsByUser = async (user) => {
  const { sheets } = await authentication();

  const request = {
    spreadsheetId,
    requestBody: {
      dataFilters: [
        {
          developerMetadataLookup: {
            metadataKey: 'user',
            metadataValue: user.id,
          }
        }
      ]
    }
  };

  const response = await sheets.spreadsheets.values.batchGetByDataFilter(request);
  const valueRanges = response.data.valueRanges;

  if (!valueRanges) {
    logger.info(`products for user.id: ${user.id} not found.`);
    return undefined;
  }

  const products = []; // Array of product objects
  for (let i = 0; i < valueRanges.length; i++) {
    const values = valueRanges[i].valueRange.values[0];
    products.push(decodeProduct(values));
  }

  return products;
};


// Save a new user to the Users sheet.  SINGLE PRODUCT
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


// Update a user in the Users sheet.  SINGLE PRODUCT
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