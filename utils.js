const MongoClient = require('mongodb').MongoClient;

var _db = null;

module.exports.getDb = function() {
    return _db;
};

module.exports.init = function() {
    // MongoClient.connect('mongodb://localhost:27017/test', function(err, client) {
    //     if (err)
    //         console.log('unable to connect to DB');
    //     else
    //         _db = client.db('test');
    // });
    MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/forum", function (err, client) {
        if (err) {
            console.log(err);
            process.exit(1);
        } else {
            _db = client.db('test');
        }
    });
};

