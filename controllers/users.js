const usersRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');
const { validateUser } = require('../models/User');

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
      return response.status(401).json({ 'error': 'You do not have admin privilages' });
    }
  }

  const id = request.params.id;
  const userToChange = (await userSheetService.findUsers(id, 'id'))[0];

  if (!userToChange) {
    return response.status(404).json({ 'error': 'User not found' });
  }

  const changedUser = Object.assign(userToChange, request.body);
  validateUser(changedUser);

  const updatedUser = await userSheetService.updateUser(changedUser);

  response.json(updatedUser);
});

module.exports = usersRouter;