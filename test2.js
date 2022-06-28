const User = require('./models/User');

const user = Object.seal(new User(
  '12345',
  'bobert123',
  'bob',
  'sadfsadfsadfsadfsdafsdfsdf',
  true,
  'ADMIN',
  ['12342342314123','123423421342134231','123423421342134'],
));

console.log(user);

user.what = 'huh?';

console.log(user);