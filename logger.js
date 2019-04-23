const fs = require('fs');
var date = new Date();

var logit = (method, url, status, time = date.toString()) => {
    var log = `${time}: ${method} ${url} - ${status}\n`;

    fs.appendFile('server.log', log, (error) => {
        if (error)
            console.log('Unable to Log message\n\n\n\nError:'+String(error));
    });
};

var loguser = (action, status, username, time = date.toString()) => {
    var log = `${time}: ${username} ${action} - ${status}\n`;
    fs.appendFile('users.log', log, (error) =>{
        if (error)
            console.log('Unable to Log message\n\n\n\nError:'+String(error));
    });
};

var logDB = (action, name, status = "Success", time = date.toString()) => {
    var log = `${time}: ${name} ${action} - ${status}\n`;
    fs.appendFileSync('database.log', log)
};

var logerror = (error, method, time = date.toString()) => {
    var log = `${time}: Method: ${method} - ${error}\n`;

    fs.appendFile('errors.log.log', log, (error) =>{
        if (error)
            console.log('Unable to Log message\n\n\n\nError:'+String(error));
    });
};

var retrieveServer = () => {
    if(fs.existsSync('server.log'))
        return fs.readFileSync('server.log');
    else
        return console.log('No log file exists yet')
};

var retrieveUser = () => {
    if(fs.existsSync('users.log'))
        return fs.readFileSync('users.log');
    else
        return console.log('No log file exists yet')
};

var retrieveDB = () => {
    if(fs.existsSync('database.log'))
        return fs.readFileSync('database.log');
    else
        return console.log('No log file exists yet')
};

var retrieveError = () => {
    if(fs.existsSync('errors.log.log'))
        return fs.readFileSync('errors.log.log');
    else
        return console.log('No log file exists yet')
}
var logMessage = (name, email, subject, message, time = date.toString()) => {
    fs.appendFileSync('userMessages.log', `${time}: Name: ${name} Email: ${email} \n\n ${subject}: ${message}\n\n\n`)
};

module.exports = {
    logit,
    loguser,
    logDB,
    logMessage,
    retrieveServer,
    retrieveDB,
    retrieveUser,
    retrieveError,
    logerror
};