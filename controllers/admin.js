const adminRouter = require('express').Router();
// const User = require('../models/user');
const logger = require('../utils/logger');

// Toggle a user's active status
adminRouter.post('/:id', async (request, response) => {
  // const adminUser = request.user;

  // if (adminUser.privilages !== 'ADMIN') {
  //   logger.info(`User ${adminUser.username} does not have admin privilages.`);
  //   return response.status(401).json({ 'error': 'You do not have admin privilages' });
  // }

  // const id = request.params.id;
  // const userToChange = await User.findById(id);
  // userToChange.enabled = !userToChange.enabled;

  // const updatedUser = await User.findByIdAndUpdate(id, userToChange, { new: true });

  // response.json(updatedUser);
  response.json({ message: 'toggle user enpoint' });
});

module.exports = adminRouter;