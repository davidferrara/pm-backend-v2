const registerRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');
const bcrypt = require('bcrypt');
// const logger = require('../utils/logger');

// Create a new user
registerRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  const existingUser = await userSheetService.findUserByUsername(username);
  if (existingUser) {
    return response.status(400).json({ error: 'Username already exists.' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = {
    id: '',
    username,
    name,
    passwordHash,
    enabled: false,
    privilages: 'EMPLOYEE',
    products: ''
  };

  const savedUser = await userSheetService.saveNewUser(user);
  response.status(201).json(savedUser);
});

module.exports = registerRouter;