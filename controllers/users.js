const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');

// Get all the users
usersRouter.get('/', async (request, response) => {
  const users = await userSheetService.getAllUsers();

  response.json(users);
});

// Create a new user
usersRouter.post('/', async (request, response) => {
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

  const savedUser = await userSheetService.saveUser(user);
  response.status(201).json(savedUser);
});

module.exports = usersRouter;