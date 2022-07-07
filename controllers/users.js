const logger = require('../utils/logger');
const usersRouter = require('express').Router();
// const userSheetService = require('../utils/userSheetService');
const { User, validateUser } = require('../models/User');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const config = require('../utils/config');

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const USER_SHEET_ID = config.USER_SHEET_ID;

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

const authentication = async () => {
  await doc.useServiceAccountAuth({
    client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: config.GOOGLE_PRIVATE_KEY,
  });
};


// Get all the users
usersRouter.get('/', async (request, response) => {
  await authentication();
  await doc.loadInfo();

  const users = await userSheetService.getAllUsers();

  response.json(users);
});

// Update a user.
usersRouter.put('/:id', async (request, response) => {
  const loggedInUser = request.user;

  //Not allowed to change the user id.
  if (request.body.id) {
    return response.status(400).json({ 'error': 'malformed request' });
  }

  //Only allowed to change user privilages and enabled status if logged in user is ADMIN
  if (request.body.privilages || request.body.enabled) {
    if (loggedInUser.privilages !== 'ADMIN') {
      logger.info(`User ${loggedInUser.username} does not have admin privilages.`);
      return response.status(401).json({ 'error': 'You do not have admin privilages' });
    }
  }

  const id = request.params.id;
  const userToChange = await userSheetService.findUserById(id);

  if (!userToChange) {
    return response.status(404).json({ 'error': 'User not found' });
  }

  const changedUser = Object.assign(userToChange, request.body);
  validateUser(changedUser);

  const updatedUser = await userSheetService.updateUser(changedUser);

  response.json(updatedUser);
});




// // Get all the users
// usersRouter.get('/', async (request, response) => {
//   const users = await userSheetService.getAllUsers();

//   response.json(users);
// });

// // Update a user.
// usersRouter.put('/:id', async (request, response) => {
//   const loggedInUser = request.user;

//   //Not allowed to change the user id.
//   if (request.body.id) {
//     return response.status(400).json({ 'error': 'malformed request' });
//   }

//   //Only allowed to change user privilages and enabled status if logged in user is ADMIN
//   if (request.body.privilages || request.body.enabled) {
//     if (loggedInUser.privilages !== 'ADMIN') {
//       logger.info(`User ${loggedInUser.username} does not have admin privilages.`);
//       return response.status(401).json({ 'error': 'You do not have admin privilages' });
//     }
//   }

//   const id = request.params.id;
//   const userToChange = await userSheetService.findUserById(id);

//   if (!userToChange) {
//     return response.status(404).json({ 'error': 'User not found' });
//   }

//   const changedUser = Object.assign(userToChange, request.body);
//   validateUser(changedUser);

//   const updatedUser = await userSheetService.updateUser(changedUser);

//   response.json(updatedUser);
// });

module.exports = usersRouter;