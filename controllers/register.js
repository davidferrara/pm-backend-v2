const registerRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');
const bcrypt = require('bcrypt');
const ObjectID = require('bson').ObjectID;
const { User, validateUser } = require('../models/User');
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

  const newUser = Object.seal(new User(
    new ObjectID().toString(),
    username,
    name,
    passwordHash,
    false,
    'EMPLOYEE',
    []
  ));

  validateUser(newUser);

  const savedUser = await userSheetService.saveUser(newUser);
  response.status(201).json(savedUser);
});

module.exports = registerRouter;