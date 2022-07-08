/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../utils/config');
const loginRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');
const ObjectID = require('bson').ObjectID;
const { User, validateUser } = require('../models/User');

// Login an existing user.
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = (await userSheetService.findUsers(username, 'username'))[0];
  const passwordCorrect = user === undefined
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid username or password.'
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: '9h' });

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});


// Create a new user
loginRouter.post('/sign-up', async (request, response) => {
  const { username, name, password } = request.body;

  const existingUser = await userSheetService.findUsers(username, 'username');
  if (existingUser) {
    return response.status(400).json({ error: 'Username already exists.' });
  }
  if (existingUser === -1) {
    return response.status(500);
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


module.exports = loginRouter;