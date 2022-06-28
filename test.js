const ObjectID = require('bson').ObjectID;
const { google } = require('googleapis');
const config = require('./utils/config');
const { convertToUserArrays } = require('./models/User.org');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = config.SPREADSHEET_ID;
const userSheetId = config.USER_SHEET_ID;

const user = {
  id: '',
  username: 'Sponge',
  name: 'Bob',
  passwordHash: 'asdfhjkl',
  enabled: false,
  privilages: 'EMPLOYEE',
  products: ''
};

const convertRowToRange = (row) => `Users!A${row}:G${row}`;

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

const getUserByID = async (id) => {
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
  console.log(response.data.matchedDeveloperMetadata[0].developerMetadata.location.dimensionRange.endIndex);

};

const saveNewUser = async () => {
  const { sheets } = await authentication();

  const request = {
    spreadsheetId,
    // requestBody must be key:value pairs
    requestBody: {
      'requests': [
        {
          'createDeveloperMetadata': {
            'developerMetadata': {
              'location': {
                'dimensionRange': {
                  'sheetId': userSheetId,
                  'dimension': 'ROWS',
                  'startIndex': 6,
                  'endIndex': 7
                }
              },
              'visibility': 'DOCUMENT',
              'metadataKey': 'Sales',
              'metadataValue': '2022'
            }
          }
        }
      ]
    },
  };


  const response = await sheets.spreadsheets.batchUpdate(request);
  console.log(response);
  const tidy = response.data.replies.map(function (d) {
    return {
      id: d.createDeveloperMetadata.developerMetadata.metadataId,
      key: d.createDeveloperMetadata.developerMetadata.metadataKey,
      value: JSON.parse(d.createDeveloperMetadata.developerMetadata.metadataValue)
    };
  });

  console.log(tidy);
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

// saveNewUser();
// getMetaData('62a10353dec79703a422e39d');
// getMetaData2();
// deleteMetaData();
getUserByID('62a25adac3b83c3d305fe7f3');
