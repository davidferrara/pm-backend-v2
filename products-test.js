const ObjectID = require('bson').ObjectID;
const { google } = require('googleapis');
const config = require('./utils/config');
const { convertToProductArrays } = require('./models/Product');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = config.SPREADSHEET_ID;
const productSheetId = config.PRODUCT_SHEET_ID;


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

const saveNewProduct = async () => {
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
        }
      ]
    },
  };

  await sheets.spreadsheets.batchUpdate(metaDataRequest);
  return savedProduct;
};

const getMetaData = async (id) => {
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
  console.log(response.data);
  // var tidy = response.data.matchedDeveloperMetadata.map(function (d) {
  //   return {
  //     id: d.developerMetadata.metadataId,
  //     key: d.developerMetadata.metadataKey,
  //     value: d.developerMetadata.metadataValue,
  //     location: d.developerMetadata.location.dimensionRange,
  //   };
  // });

  // console.log(tidy);
};

const getMetaData2 = async () => {
  const { sheets } = await authentication();

  const request = {
    spreadsheetId,
    requestBody: {
      dataFilters: [
        {
          developerMetadataLookup: {
            metadataKey: 'id',
          }
        }
      ]
    }
  };

  const response = await sheets.spreadsheets.developerMetadata.search(request);
  // console.log('A', response);
  console.log('B', response.data);
  // console.log('C', response.data.matchedDeveloperMetadata);
  // console.log('D', response.data.matchedDeveloperMetadata[0]);
  // console.log('E', response.data.matchedDeveloperMetadata[0].developerMetadata);
  // console.log('F', JSON.parse(response.data.matchedDeveloperMetadata[0].developerMetadata.metadataValue));
  // const thing  = JSON.parse(response.data.matchedDeveloperMetadata[0].developerMetadata.metadataValue);
  // console.log(thing.username);

  // var tidy = response.data.matchedDeveloperMetadata.map(function (d) {
  //   return {
  //     id: d.developerMetadata.metadataId,
  //     key: d.developerMetadata.metadataKey,
  //     value: d.developerMetadata.metadataValue,
  //     location: d.developerMetadata.location.dimensionRange,
  //   };
  // });

  // console.log(tidy);
};

const deleteMetaData = async () => {
  const { sheets } = await authentication();

  const request = {
    spreadsheetId,
    requestBody: {
      'requests': [
        {
          'deleteDeveloperMetadata': {
            'dataFilter': {
              'developerMetadataLookup': {
                'metadataKey': 'user'
              }
            }
          }
        }
      ]
    },
  };

  const response = await sheets.spreadsheets.batchUpdate(request);
  console.log(response);
};

saveNewProduct();
// getMetaData('62a10353dec79703a422e39d');
// getMetaData2();
// deleteMetaData();
// getUserByID('62a25adac3b83c3d305fe7f3');