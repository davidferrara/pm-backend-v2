/* eslint-disable no-undef */
require('dotenv').config();

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const USER_SHEET_ID = process.env.USER_SHEET_ID;
const PRODUCT_SHEET_ID = process.env.PRODUCT_SHEET_ID;

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

module.exports = {
  PORT,
  SECRET,
  SPREADSHEET_ID,
  USER_SHEET_ID,
  PRODUCT_SHEET_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
};