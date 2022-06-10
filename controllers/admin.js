const adminRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');
const logger = require('../utils/logger');

// Toggle a user's active status
// adminRouter.post('/:id', async (request, response) => {
//   const adminUser = request.user;
//   console.log('adminUser:',adminUser);

//   if (adminUser.privilages !== 'ADMIN') {
//     logger.info(`User ${adminUser.username} does not have admin privilages.`);
//     return response.status(401).json({ 'error': 'You do not have admin privilages' });
//   }

//   const id = request.params.id;
//   console.log('id:', id);
//   const userToChange = await userSheetService.findUserById(id);
//   console.log('userToChange:', userToChange);
//   if (!userToChange) {
//     return response.status(404).json({ 'error': 'User not found' });
//   }
//   userToChange.enabled = !userToChange.enabled;

//   const updatedUser = await userSheetService.findByIdAndUpdate(id, userToChange);

//   // response.json(updatedUser);
//   response.json({ message: 'toggle user enpoint' });
// });

adminRouter.put('/:id', async (request, response) => {
  const adminUser = request.user;
  console.log('adminUser:',adminUser);

  if (adminUser.privilages !== 'ADMIN') {
    logger.info(`User ${adminUser.username} does not have admin privilages.`);
    return response.status(401).json({ 'error': 'You do not have admin privilages' });
  }

  const id = request.params.id;
  console.log('id:', id);
  const userToChange = await userSheetService.findUserByIdV2(id);
  console.log('userToChange:', userToChange);
  // if (!userToChange) {
  //   return response.status(404).json({ 'error': 'User not found' });
  // }
  // userToChange.enabled = !userToChange.enabled;

  // const updatedUser = await userSheetService.findByIdAndUpdate(id, userToChange);

  // response.json(updatedUser);
  response.json({ message: 'toggle user enpoint' });
});

module.exports = adminRouter;