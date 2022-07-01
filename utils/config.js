/* eslint-disable no-undef */
require('dotenv').config();

const PORT = process.env.PORT;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const USER_SHEET_ID = process.env.USER_SHEET_ID;
const PRODUCT_SHEET_ID = process.env.PRODUCT_SHEET_ID;

module.exports = {
  PORT,
  SPREADSHEET_ID,
  USER_SHEET_ID,
  PRODUCT_SHEET_ID,
};