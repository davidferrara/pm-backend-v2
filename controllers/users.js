/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt');
const ObjectID = require('bson').ObjectID;
const usersRouter = require('express').Router();
const logger = require('../utils/logger');
// const {
//   getAuthToken,
//   getSpreadSheet,
//   getSpreadSheetValues,
//   authentication
// } = require('../utils/googleSheetsService');
const sheetService = require('../utils/googleSheetsService');

// Get all the users
usersRouter.get('/', async (request, response) => {
  // const auth = await getAuthToken();
  // const ss = await getSpreadSheet({
  //   auth
  // });
  // console.log('output for getSpreadSheet', JSON.stringify(ss.data, null, 2));
  // const users = await User.find({}).populate('products');
  const id = new ObjectID();
  console.log(id.toString());

  response.json({ message: 'get users enpoint' });
});

// Create a new user
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  const existingUser = await sheetService.findUsername(username);
  if (existingUser) {
    return response.status(400).json({ error: 'Username must be unique' });
  }

  // const saltRounds = 10;
  // const passwordHash = await bcrypt.hash(password, saltRounds);

  // const user = new User({
  //   username,
  //   name,
  //   passwordHash,
  //   enabled: false,
  //   privilages: 'EMPLOYEE',
  // });

  // const savedUser = await user.save();

  // response.status(201).json(savedUser);
  // response.json({ message: 'Save user enpoint' });
});

module.exports = usersRouter;