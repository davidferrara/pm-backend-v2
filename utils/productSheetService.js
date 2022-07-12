const { GoogleSpreadsheet } = require('google-spreadsheet');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const config = require('./config');
const logger = require('./logger');
const { Product } = require('../models/Product');

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const PRODUCT_SHEET_ID = config.PRODUCT_SHEET_ID;

const productSheetService = this;
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
 * encodeProduct
 *
 * Takes a product object and converts it into an array.
 *
 * @param {Object} productObject The product object to be converted.
 * @returns A 2D array containing the productObject's values.
 */
const encodeProduct = (productObject) => {
  const result = Object.values(productObject);

  return result;
};


/**
 * decodeProduct
 *
 * Takes a GoogleSpreadsheetRow and converts it into a product object.
 *
 * @param {GoogleSpreadsheetRow} rowObject The product array to be converted.
 * @returns An product Object.
 */
const decodeRowProduct = (rowObject) => {
  const result = Object.seal(new Product(
    rowObject.id,
    rowObject.postId,
    rowObject.client,
    rowObject.reason,
    rowObject.condition,
    rowObject.conditionNotes,
    rowObject.asin,
    rowObject.expirationDate,
    Number(rowObject.quantity),
    rowObject.location,
    rowObject.dateCreated,
    rowObject.dateModified,
    rowObject.masterSku,
    rowObject.user
  ));

  return result;
};


/**
 * decodeQueryProduct
 *
 * Takes a query result and converts it into a product object.
 *
 * @param {Array} productValues The GoogleSpreadsheetRow to be converted.
 * @returns A user Object.
 */
const decodeQueryProduct = (productValues) => {
  const result = Object.seal(new Product(
    productValues[0],
    productValues[1],
    productValues[2],
    productValues[3],
    productValues[4],
    productValues[5],
    productValues[6],
    productValues[7],
    productValues[8],
    productValues[9],
    productValues[10],
    productValues[11],
    productValues[12],
    productValues[13]
  ));

  return result;
};


//--------------------------------------------------------------------------------
// Service Functions
//--------------------------------------------------------------------------------

/**
 * findProducts
 *
 * Creates a search query for a the Products sheet and returns an array
 * of Product objects, undefined, or -1 if there is an error with the
 * search query label.
 *
 * @param {string} searchTerm The term to search for in the Product sheet.
 * @param {string} label The label to search through in the Product sheet.
 * @returns undefined or an array of Product objects or -1 due to unknown label.
 */
productSheetService.findProducts = async (searchTerm, label) => {
  await authentication();

  // Switch statement to determine what column ID (A, B, C...etc)
  // to use in the search query. If the label doesn't match any
  // that are in the sheet, then it will return -1.
  let columnID;
  switch (label) {
    case 'id':
      columnID = 'A';
      break;
    case 'postId':
      columnID = 'B';
      break;
    case 'client':
      columnID = 'C';
      break;
    case 'reason':
      columnID = 'D';
      break;
    case 'condition':
      columnID = 'E';
      break;
    case 'conditionNotes':
      columnID = 'F';
      break;
    case 'asin':
      columnID = 'G';
      break;
    case 'expirationDate':
      columnID = 'H';
      break;
    case 'quantity':
      columnID = 'I';
      break;
    case 'location':
      columnID = 'J';
      break;
    case 'dateCreated':
      columnID = 'K';
      break;
    case 'dateModified':
      columnID = 'L';
      break;
    case 'masterSku':
      columnID = 'M';
      break;
    case 'user':
      columnID = 'N';
      break;
    default:
      logger.info('label not found');
      return -1;
  }

  // Create the query using the columnID and the searchTerm.
  const query = `select * where ${columnID}='${searchTerm}'`;
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${PRODUCT_SHEET_ID}&tq=${encodeURI(query)}`;
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
    const user = decodeQueryProduct(parsedResult[i]);
    finalResult.push(user);
  }

  return finalResult;
};


/**
 * saveProduct
 *
 * Saves a new product to the Product sheet.
 *
 * @param {Product} product The product object to save to the Product sheet.
 * @returns {Product} savedUser The product that was saved to the Product sheet.
 */
productSheetService.saveProduct = async (product) => {
  await authentication();
  await doc.loadInfo();

  const productSheet = doc.sheetsById[PRODUCT_SHEET_ID];

  product = encodeProduct(product);

  const savedRow = await productSheet.addRow(product, { raw: true, insert: true });

  const savedUser = decodeRowProduct(savedRow);
  return savedUser;
};


/**
 * updateProduct
 *
 * Updates an existing product on the Product sheet.
 *
 * @param {Product} product The product object to save to the Product sheet.
 * @returns {Product} savedUser The product that was saved to the Product sheet.
 */
productSheetService.updateProduct = async (product) => {
  await authentication();
  await doc.loadInfo();

  const productSheet = doc.sheetsById[PRODUCT_SHEET_ID];

  // Get all the rows and find the one with mathcing ID.
  const rows = await productSheet.getRows();
  const index = rows.findIndex(row => row.id === product.id);

  // Change the product object into an array of values.
  product = encodeProduct(product);

  // Update all the values.
  rows[index].client = product[2];
  rows[index].reason = product[3];
  rows[index].condition = product[4];
  rows[index].conditionNotes = product[5];
  rows[index].asin = product[6];
  rows[index].expirationDate = product[7];
  rows[index].quantity = product[8];
  rows[index].location = product[9];
  rows[index].dateModified = product[11];
  rows[index].masterSku = product[12];

  // Save the row with the new values.
  await rows[index].save({ raw: true });

  const savedProduct = decodeRowProduct(rows[index]);
  return savedProduct;
};

module.exports = productSheetService;