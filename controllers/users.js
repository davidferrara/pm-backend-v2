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

  if (user.privilages !== 'ADMIN') {
    logger.info(`User ${user.username} does not have admin privilages.`);
    return response.status(401).json({ 'error': 'You do not have admin privilages' });
  }

  const id = request.params.id;
  console.log('id:', id);
  const userToChange = await userSheetService.findUserById(id);
  console.log('userToChange:', userToChange);
  if (!userToChange) {
    return response.status(404).json({ 'error': 'User not found' });
  }
  console.log(request.body);
  if (request.body.id) {
    return response.status(400).json({ 'error': 'malformed request' });
  }
  if (request.body.privilages || request.body.enabled) {
    if (user.privilages !== 'ADMIN') {
      logger.info(`User ${user.username} does not have admin privilages.`);
      return response.status(401).json({ 'error': 'You do not have admin privilages' });
    }
  }

  const changedUser = Object.assign(userToChange, request.body);
  console.log('changedUser', changedUser);

  const updatedUser = await userSheetService.saveUser(changedUser);

  response.json(updatedUser);
  // response.json({ message: 'LOLOLOLOLOL' });
});

module.exports = usersRouter;