const express = require('express');
const logger = require('./logger');
const session = require('express-session');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

var setup = (app) => {
    app.use(methodOverride('_method'));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(session({
        secret: '5N3BG2Z0XZQBOWNPGOXE',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true }
    }));
    app.use(express.static(__dirname + '/public'));
    app.use((error, request, response, next) => {
        if (error)
            console.log(error);
        logger.logit(request.method, request.url, response.statusCode);
        next();
    });

    app.set('view engine', 'hbs');
};

module.exports = {
    setup
};