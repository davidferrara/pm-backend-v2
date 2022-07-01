const ObjectID = require('bson').ObjectID;

const id = new ObjectID();
console.log('id', id);
console.log(typeof(id));

const strId = id.toString();
console.log('strId', strId);
console.log(typeof(strId));

const timestamp = id.getTimestamp();
console.log('timestamp', timestamp);