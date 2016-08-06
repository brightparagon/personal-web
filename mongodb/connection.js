var mongoose = require('mongoose');
// var dbUrl = 'mongodb://username:password@mongodb:port/database';
// var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/personalblog';
var dbUrl = 'mongodb://localhost/personalblog';

mongoose.connect(dbUrl, { safe: true });

// ctrl + c -> stop mongoose
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('./models/user');
require('./models/post');
