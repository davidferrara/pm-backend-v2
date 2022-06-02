const { google } = require('googleapis');
const config = require('./config');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = config.SPREADSHEET_ID;

const sheetService = this;

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

const objectArray = (array) => {
  const keys = array.shift();
  console.log(keys);
  

};

sheetService.findUsername = async (username) => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = await sheets.spreadsheets.values.get(request);
  console.log(response);
  const users = objectArray(response.data.values);
  console.log(users);



  return response;
};

// const getAuthToken = async () => {
//   const auth = new google.auth.GoogleAuth({
//     scopes: SCOPES
//   });
//   const authToken = await auth.getClient();
//   return authToken;
// };

// const getSpreadSheet = async ({ auth }) => {
//   const res = await sheets.spreadsheets.get({
//     spreadsheetId,
//     auth,
//   });
//   return res;
// };

// const getSpreadSheetValues = async ({ auth }) => {
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     auth,
//     range: config.SHEET_NAME
//   });
//   return res;
// };


// module.exports = {
//   // getAuthToken,
//   // getSpreadSheet,
//   // getSpreadSheetValues
//   authentication
// };

module.exports = sheetService;