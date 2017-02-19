var mongoose = require('mongoose');
// var dbUrl = 'mongodb://username:password@mongodb:port/database';
// var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/personalblog';
// var dbUrl = 'mongodb://localhost/personalblog';
var dbUrl = process.env.MONGO_DB_URL;

mongoose.connect(dbUrl, { safe: true });

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('./models/user');
require('./models/post');
