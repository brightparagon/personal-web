var mongoose = require('mongoose');
// var dbUrl = 'mongodb://username:password@mongodb:port/database';
// var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/personalblog';
var dbUrl = 'mongodb://@localhost:27017/personalblog';

mongoose.connect(dbUrl, { safe: true });

// 컨트롤 + C를 누르면 몽구스 연결 종료
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected');
    process.exit(0);
  });
});

require('../models/user');
