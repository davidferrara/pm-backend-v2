/* eslint-disable no-undef */
require('dotenv').config();

const PORT = process.env.PORT;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

module.exports = {
  PORT,
  SPREADSHEET_ID
};