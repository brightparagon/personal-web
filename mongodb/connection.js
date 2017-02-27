var mongoose = require('mongoose');
// var dbUrl = 'mongodb://username:password@mongodb:port/database';
// var dbUrl = process.env.MONGO_DB_URL; // AWS
// var dbUrl = process.env.MONGODB_URI; // Heroku
// var dbUrl = 'mongodb://localhost/personalblog';
var dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/personalblog';

mongoose.connect(dbUrl, { safe: true });

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('./models/user');
require('./models/post');
