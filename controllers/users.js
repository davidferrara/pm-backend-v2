// const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const usersRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');

// Get all the users
usersRouter.get('/', async (request, response) => {
  const users = await userSheetService.getAllUsers();

  response.json(users);
});


usersRouter.put('/:id', async (request, response) => {
  const user = request.user;
  console.log('user:', user);

  // if (user.privilages !== 'ADMIN') {
  //   logger.info(`User ${user.username} does not have admin privilages.`);
  //   return response.status(401).json({ 'error': 'You do not have admin privilages' });
  // }

  // const id = request.params.id;
  // console.log('id:', id);
  // const userToChange = await userSheetService.findUserById(id);
  // console.log('userToChange:', userToChange);
  // if (!userToChange) {
  //   return response.status(404).json({ 'error': 'User not found' });
  // }
  // userToChange.enabled = !userToChange.enabled;

  // const updatedUser = await userSheetService.findByIdAndUpdate(id, userToChange);

  // response.json(updatedUser);
  response.json({ message: 'update user enpoint' });
});

module.exports = usersRouter;