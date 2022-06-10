/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const userSheetService = require('../utils/userSheetService');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = await userSheetService.findUserByUsername(username);
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

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '9h' });

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;