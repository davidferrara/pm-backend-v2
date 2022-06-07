const ObjectID = require('bson').ObjectID;
const { google } = require('googleapis');
const config = require('./config');
const {
  convertToUserObject,
  convertToUserArray
} = require('../models/User');
const { validateUser } = require('./validation');

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

sheetService.getAllUsers = async () => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const users = convertToUserObject(response);

  return users;
};

sheetService.findUserByUsername = async (username) => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const users = convertToUserObject(response);
  const user = users.find(u => u.username === username);

  return user;
};

sheetService.findUserById = async (id) => {
  const { sheets } = await authentication();
  const request = {
    spreadsheetId,
    range: 'Users'
  };
  const response = (await sheets.spreadsheets.values.get(request)).data.values;
  response.shift(); // Removes the tableheader from the data


  const users = convertToUserObject(response);
  const user = users.find(u => u.id === id);

  return user;
};

sheetService.saveUser = async (user) => {
  const { sheets } = await authentication();
  const id = new ObjectID();
  user.id = id.toString();

  validateUser(user);
  user = convertToUserArray([user]);

  const request = {
    spreadsheetId,
    range: 'Users',
    valueInputOption: 'RAW',
    includeValuesInResponse: true,
    responseValueRenderOption: 'UNFORMATTED_VALUE',
    resource: {
      values: user
    }
  };

  const response = (await sheets.spreadsheets.values.append(request)).data.updates.updatedData.values;
  const savedUser = convertToUserObject(response);
  return savedUser;
};

module.exports = sheetService;