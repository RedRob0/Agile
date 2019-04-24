const utils = require('./utils');
const logger = require('./logger');

// List of decrypted characters
var decrypted = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "?", ">", "<", "`", "~", "-", "_", "+",
    "=", "]", "[", "{", "}", "/", "|"];


// List of encrypted characters
var encrypted = ['YQzl9', 'grnuv', '4POI6', 'VvJcG', 'bOMkp', 'SqEi7', 'ua8b3', '1TFcn', 'wh9E9', '4qcs4', 'ceKgO', 'edlCG', '10eRZ', '3Y3gN',
    'DOLVr', '46Z7b', 'rtr0W', 'nKWjd', 'rxq5i', 'TCjao', '3o4ci', 'N0c1k', 'AR9hj', '7Yasn', 'nLlzj', 'AGabu', 'l8ApV', 'eeNXm', 'o8BDl',
    'PK2za', 'ECS9h', 'uZjWI', 'ecYTX', 'LeCmb', '3yx76', 'MB2vd', 'yJ2zb', 'vvIJB', 'sbuoM', 'JuCMK', 'TpXq2', 'aVBTp', 'u9Jyl', 'VpGwr',
    'r88Mp', 'ih8fE', 'whmmA', 'U5fX0', 'JfcWw', 'NIDFP', 'T5m3i', 'bJY3o', 'jpG2t', 'nUDsJ', 'ljUJ4', 'PBN7g', 'RrUOh', 'uH73A', 'j6CiF',
    'B9pqW', 'XN4mC', '8XPNj', 'z2Gfs', 'D5Sy2', 'nyvZD', 'qxwNh', 'ssCom', 'rLC5O', 'ZXz7r', 'lxPAO', 'bxznz', 'Mx5fj', 'N95ET', 'XwAuA',
    'ntyDK', 'jq1ba', 'fO8vi', 'myAt1', 'yjoI5', 'KA8nq', '5ePFF', 'MOGew', 'TABqf', 'ltZme', 'WjqHn', 'hnvFW', '119QG'];

// Authenticates a User
var authenticate = (name, password, callback) => {
    password = encrypt(password);
    var db = utils.getDb();

    var message = undefined;

    db.collection('users').findOne({name:name,password:password}, (err, result)=>{
        if (err)
            logger.logerror(err, "users.authenticate");
        else if (result === null) {
            logger.loguser("Log In", "Failed (No Matching Users)", name);
            message =  "No Matching Users";
            callback(message, false);
        }
        else {
            logger.loguser("Log In", "Success", name);
            logger.logDB('Get Users', "users");
            message =  "Logged In";
            callback(message, result.admin);
        }
    });
};

// Adds a User to Database
var addUser = (name, password, callback) => {
    var db = utils.getDb();
    db.collection('users').findOne({name:name}, (err, result) =>{
        if (err)
            logger.logerror(err, "users.addUser");
        else if (result !== null) {
            logger.loguser("Sign Up", "Failed (Already Exists)", name);
            callback("Failed User Already Exists")
        } else {
            password = encrypt(password);
            db.collection('users').insertOne({
                name: name,
                password: password,
                admin: false
            }, (err, result) => {
                if (err) {
                    logger.loguser("Sign Up", "Failed", name);
                    callback('Unable to store user data');
                }
                logger.loguser("Sign Up", "Success", name);
            });
            callback('Created Successfully');
        }
    });
};

// Adds a User to Database
var addAdmin = (name, password, callback) => {
    var db = utils.getDb();
    db.collection('users').findOne({name:name}, (err, result) =>{
        if (err)
            logger.logerror(err, "users.addAdmin");
        else if (result !== null) {
            logger.loguser("Sign Up", "Failed (Already Exists)", name);
            callback("Failed User Already Exists")
        } else {
            password = encrypt(password);
            db.collection('users').insertOne({
                name: name,
                password: password,
                admin: true
            }, (err, result) => {
                if (err) {
                    logger.loguser("Sign Up", "Failed", name);
                    callback('Unable to store user data');
                }
                logger.loguser("Sign Up", "Success", name);
            });
            callback('Created Successfully');
        }
    });
};

// Checks for admin on an account
var checkAdmin = (name, callback) => {
    var db = utils.getDb();
    db.collection('users').findOne({name:name}, (err, result) => {
        if (err)
            logger.logerror(err, "users.checkAdmin");
        else if (result === null){
            logger.loguser("Check Admin", "Failed (Cannot find user)", name);
            callback(false)
        }
        else
            callback(result.admin)
    })
};

// Encrypts a string
var encrypt = (string) => {
    var encryptedString = '';
    for (var i = 0; i <= string.length-1; i++){
        var letter = string.charAt(i);
        var position = decrypted.indexOf(letter);
        encryptedString = `${encryptedString}${encrypted[position]}`
    }
    return encryptedString
};

// Decrypts a String
var decrypt = (string) => {
    var decryptedString = '';
    for (var i = 0; i <= string.length-1; i+=5){
        var encryptedString = `${string.charAt(i)}${string.charAt(i+1)}${string.charAt(i+2)}${string.charAt(i+3)}${string.charAt(i+4)}`;
        var position = encrypted.indexOf(encryptedString);
        decryptedString = `${decryptedString}${decrypted[position]}`
    }
    return decryptedString
};


module.exports = {
    authenticate,
    addUser,
    addAdmin
};

// Used To Generate the Encrypted List and check for duplicates
// var range = (start, end, count = 1) => {
//     var ans = [];
//     for (let i = start; i <= end; i+=count) {
//         ans.push(i);
//     }
//     return ans;
// }
// var generateEncrpyted = () => {
//     encrypted = []
//     for (i in decrypted){
//         var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
//         var x = 4;
//         var string = ''
//         for (j in range(0,x)){
//             string = `${string}${possible.charAt(Math.floor(Math.random() * possible.length))}`
//         }
//         encrypted.push(string)
//     }
//     console.log(encrypted)
// }
// generateEncrpyted()
// var checkUnique = (list) => {
//     var unique = Array.from(new Set(list))
//     return unique.length === list.length
// }
// console.log(checkUnique(encrypted))
// console.log(encrypted.length == decrypted.length)
