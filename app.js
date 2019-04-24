const express = require('express');
const hbs = require('hbs');
const utils = require('./utils');
const {ObjectId} = require("mongodb");
const users = require('./users');
const moment = require('moment');
const expressConfig = require('./expressConfig');
const logger = require('./logger');
const adminPassword = "adminPass";
var app = express();
expressConfig.setup(app);
var currentMessage = undefined;
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('isMessage', () => {
    return currentMessage !== undefined;
});
var loggedIn = (response) => {
    return response.cookie.username !== undefined;
};
hbs.registerHelper('getMessage', () => {
    return currentMessage;
});

hbs.registerHelper('clearMessage', () => {
    currentMessage = undefined;
});

app.get('/', (request, response) => {
    response.render('Homepage.hbs', {user:response.cookie.username});
});

app.get('/Loginpage', (request, response) => {
    if (loggedIn(response)){
        currentMessage = "Already Logged In";
        response.redirect("/")
    }
    response.render('Loginpage.hbs', {user:response.cookie.username});
});

app.get('/Makeaccountpage',(request, response) => {
    if (loggedIn(response)){
        currentMessage = "Already Logged In";
        response.redirect("/")
    }
    response.render('Makeaccountpage.hbs');
});

app.get('/Adminmakeaccountpage', (request, response) => {
    if (loggedIn(response)){
        currentMessage = "Already Logged In";
        response.redirect("/")
    }
    if (!response.cookie.admin) {
        currentMessage = "No Access to this page";
        response.redirect('/Makeaccountpage');
    }
    response.render('Makeadminaccountpage.hbs')
});

app.get('/admincheck', (request, response) => {
    if (response.cookie.admin === true){
        currentMessage = "Already an admin";
        response.redirect('/Adminmakeaccountpage')
    }
    else
        response.render('admincheck.hbs')
});

app.get('/Contact', (request, response) => {
    response.render('Contact.hbs', {user:response.cookie.username});
});

app.get('/Logout', (request, response) => {
    logger.loguser("Logout", "Success", response.cookie.username);
    response.cookie.username = undefined;
    response.redirect('/');
});

app.post('/register', (request, response) => {
    var username = request.body.name;
    var password = request.body.password;
    users.addUser(String(username), String(password), (message) =>{
        if (message === "Created Successfully") {
            response.cookie.username = username;
            response.redirect('/')
        }
        else {
            currentMessage = message;
            response.redirect('/Makeaccountpage')
        }
    });
});

app.post('/registerAdmin', (request, response) => {
    if (!response.cookie.admin) {
        currentMessage = "No Access to this page";
        response.redirect('/Makeaccountpage');
    }
    var username = request.body.name;
    var password = request.body.password;
    users.addAdmin(String(username), String(password), (message) =>{
        if (message === "Created Successfully") {
            response.cookie.username = username;
            response.redirect('/')
        }
        else {
            currentMessage = message;
            response.redirect('/Adminmakeaccountpage')
        }
    });
});

app.post('/VerifyAdminPass', (request, response) => {
    var password = request.body.password;
    if (password === adminPassword){
        response.cookie.admin = true;
        currentMessage = "Admin Verification Success!";
        response.redirect('/Adminmakeaccountpage')
    }
    else{
        currentMessage = "Sorry, wrong password";
        response.redirect('/admincheck')
    }
});

app.post('/login', (request, response) => {
    var username = request.body.name;
    var password = request.body.password;
    users.authenticate(String(username), String(password), (message, admin) => {
        if (message === "Logged In"){
            response.cookie.username = username;
            response.cookie.admin = admin;
            response.redirect('/')
        }
        else {
            currentMessage = message;
            response.redirect('/Loginpage');
        }
    });
});

app.get('/logs', (request, response) => {
    if(loggedIn(response)){
        response.render('log.hbs', {user:response.cookie.username})
    } else {
        currentMessage = "Must be Logged in to view logs";
        response.redirect('/Loginpage');
    }
});
app.get('/server.log', (request, response) => {
    if (loggedIn(response)){
        response.download(__dirname+"/server.log")
    } else{
        currentMessage = "Must be Logged in to view logs";
        response.redirect('/Loginpage');
    }
});
app.get('/database.log', (request, response) => {
    if (loggedIn(response)){
        response.download(__dirname+"/database.log")
    } else{
        currentMessage = "Must be Logged in to view logs";
        response.redirect('/Loginpage');
    }
});
app.get('/users.log', (request, response) => {
    if (loggedIn(response)){
        response.download(__dirname+"/users.log")
    } else{
        currentMessage = "Must be Logged in to view logs";
        response.redirect('/Loginpage');
    }
});
app.get('/errors.log', (request, response) => {
    if (loggedIn(response)){
        response.download(__dirname+"/errors.log")
    } else{
        currentMessage = "Must be Logged in to view logs";
        response.redirect('/Loginpage');
    }
});
app.get('/sales', (request, response) => {
    if (loggedIn(response)){
        var db = utils.getDb();
        db.collection('sales').find({}).toArray((err, result) => {
            if (err) {
                logger.logDB('Get Sales', "sales", "Failed");
                currentMessage = 'Unable to retrieve sales data';
                response.redirect('/sales')
            }
            logger.logDB('Get Sales', "sales");
            response.render('sales.hbs', {sales:result, user:response.cookie.username})
        });
    }
    else{
        currentMessage = "Please Login to view sales";
        response.redirect('/Loginpage');
    }
});

app.get('/sales-add-form', (request, response) => {
    if (loggedIn(response)){
        var db = utils.getDb();
        db.collection('products').find({}).toArray((err, result) => {
            if (err) {
                logger.logDB('Get Sales', "sales", "Failed");
                currentMessage = 'Unable to retrieve products data';
                response.redirect('/sales')
            }
            logger.logDB('Get Sales', "sales");
            response.render('sales-add-form.hbs', {products: result, user:response.cookie.username})
        });
    }
    else{
        currentMessage = "Please Login to view sales";
        response.redirect('/Loginpage');
    }
});

app.get('/sales-edit-form/:id', (request, response) => {
    if (loggedIn(response)){
        var db = utils.getDb();
        db.collection("sales").findOne({ _id: ObjectId(request.params.id) }, function(err, result) {
            if (err) {
                logger.logDB('Get Sales by ID', "sales", "Failed");
                response.send('Unable to retrieve sales data');
            }
            else if (result  === null) {
                logger.logDB('Get Sales by ID', "products", "Failed");
                currentMessage = "No sale found with the given id";
                response.redirect('/sales');
            }
            else
                db.collection('products').find({}).toArray((err, productsResult) => {
                    if (err) {
                        currentMessage = 'Unable to retrieve products data';
                        response.redirect('/sales')
                    }
                    response.render('sales-edit-form.hbs', {products: productsResult, sale: result, user:response.cookie.username})
                });
        });
    }
    else{
        currentMessage = "Please Login to view sales";
        response.redirect('/Loginpage');
    }
});

app.post('/sales', (request, response) => {
    if (loggedIn(response)){
        var item = request.body.item;
        var quantity = request.body.quantity;
        var unit_price = request.body.unit_price;
        var created_date_time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        var db = utils.getDb();
        db.collection('sales').insertOne({
            item: item,
            quantity: quantity,
            unit_price: unit_price,
            created_date_time: created_date_time,
            update_date_time: created_date_time,
        }, (err, result) => {
            if (err) {
                logger.logDB('Make Sales', "sales", "Failed");
                currentMessage = 'Unable to store sales data';
                response.redirect('/sales-add-form');
            }
            else {
                logger.logDB('Make Sales', "sales");
                currentMessage = 'Created Successfully';
                response.redirect('/sales');
            }
        });
    }
    else{
        currentMessage = "Please Login to view sales";
        response.redirect('/Loginpage');
    }

});

app.put('/sales/:id', (request, response) => {
    var item = request.body.item;
    var quantity = request.body.quantity;
    var unit_price = request.body.unit_price;
    var update_date_time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    var db = utils.getDb();
    db.collection("sales").updateOne({ _id: ObjectId(request.params.id) }, {
        $set: {
            item: item,
            quantity: quantity,
            unit_price: unit_price,
            update_date_time: update_date_time,
        }
    }, function(err, result) {
        if (err) {
            logger.logDB('Update Sales', "sales", "Failed");
            currentMessage = 'Unable to update sales data';
            response.redirect('/sales-edit-form/'+request.params.id)
        }
        else if (result === null) {
            logger.logDB('Update Sales', "sales", "Failed");
            currentMessage = 'There is no sale with the given id';
            response.redirect('/sales')
        }
        else {
            logger.logDB('Update Sales', "sales");
            currentMessage = 'Updated Successfully';
            response.redirect('/sales')
        }
    });
});

app.delete('/sales/:id', (request, response) => {
    var db = utils.getDb();
    db.collection("sales").findOneAndDelete({ _id: ObjectId(request.params.id) }, function(err, result) {
        if (err) {
            logger.logDB('Delete Sales', "sales", "Failed");
            currentMessage = 'Unable to delete sales data';
            response.redirect('/sales');
        }
        else if (result === null) {
            logger.logDB('Delete Sales', "sales", "Failed");
            currentMessage = 'There is no sale with the given id';
            response.redirect('/sales');
        }
        else {
            logger.logDB('Delete Sales', "sales");
            currentMessage = 'Deleted Successfully';
            response.redirect('/sales');
        }
    });
});

app.get('/sales/:id', (request, response) => {
    var db = utils.getDb();
    db.collection("sales").findOne({ _id: ObjectId(request.params.id) }, function(err, result) {
        if (err) {
            logger.logDB('Get Sales by ID', "sales", "Failed");
            currentMessage = 'Unable to retrieve sales data';
            response.redirect('/')
        }
        logger.logDB('Get Sales by ID', "sales");
        response.send(JSON.stringify(result, undefined, 2));
    });
});

app.post('/contacts', (request, response) => {
    var name = request.body.name;
    var email = request.body.email;
    var subject = request.body.subject;
    var message = request.body.message;
    logger.logMessage(name, email, subject, message);
    currentMessage = "Message Sent";
    response.redirect('/Contact')
});

app.post('/products', (request, response) => {
    if (loggedIn(response)){
        var name = request.body.name;
        var created_date_time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        var db = utils.getDb();
        db.collection('products').insertOne({
            name: name,
            created_date_time: created_date_time,
            update_date_time: created_date_time,
        }, (err, result) => {
            if (err) {
                logger.logDB('Make Product', "products", "Failed");
                currentMessage = 'Unable to store products data';
                response.redirect('/products-add-form');
            }
            else {
                logger.logDB('Make Product', "products");
                currentMessage = 'Created Successfully';
                response.redirect('/products');
            }
        });
    }
    else {
        currentMessage = "Please Login to view products";
        response.redirect('/Loginpage');
    }
});

app.put('/products/:id', (request, response) => {
    var name = request.body.name;
    var update_date_time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    var db = utils.getDb();
    db.collection("products").updateOne({ _id: ObjectId(request.params.id) }, {
        $set: {
            name: name,
            update_date_time: update_date_time,
        }
    }, function(err, result) {
        if (err) {
            logger.logDB('Update Product', "products", "Failed");
            currentMessage = 'Unable to update products data';
            response.redirect('/products-edit-form/'+request.params.id)
        }
        else if (result === null) {
            logger.logDB('Update Product', "products", "Failed");
            currentMessage = 'There is no product with the given id';
            response.redirect('/products')
        }
        else {
            logger.logDB('Make Product', "products");
            currentMessage = 'Updated Successfully';
            response.redirect('/products')
        }
    });
});

app.delete('/products/:id', (request, response) => {
    var db = utils.getDb();
    db.collection("products").findOneAndDelete({ _id: ObjectId(request.params.id) }, function(err, result) {
        if (err) {
            logger.logDB('Delete Product', "products", "Failed");
            currentMessage = 'Unable to delete products data';
            response.redirect('/products');
        }
        else if (result === null) {
            logger.logDB('Delete Product', "products", "Failed");
            currentMessage = 'There is no product with the given id';
            response.redirect('/products');
        }
        else {
            logger.logDB('Delete Product', "products");
            currentMessage = 'Deleted Successfully';
            response.redirect('/products');
        }
    });
});

app.get('/products', (request, response) => {
    if (loggedIn(response)){
        var db = utils.getDb();
        db.collection('products').find({}).toArray((err, result) => {
            if (err) {
                logger.logDB('Get Product', "products", "Failed");
                currentMessage = 'Unable to retrieve products data';
                response.redirect('/products')
            }
            logger.logDB('Get Product', "products");
            response.render('products.hbs', {products:result, user:response.cookie.username})
        });
    }
    else{
        currentMessage = "Please Login to view products";
        response.redirect('/Loginpage');
    }
});

app.get('/products-add-form', (request, response) => {
    if (loggedIn(response))
        response.render('products-add-form.hbs', {user:response.cookie.username});
    else {
        currentMessage = "Please Login to view products";
        response.redirect('/Loginpage');
    }
});

app.get('/products-edit-form/:id', (request, response) => {
    if (loggedIn(response)){
        var db = utils.getDb();
        db.collection("products").findOne({ _id: ObjectId(request.params.id) }, function(err, result) {
            if (err) {
                logger.logDB('Get Product by ID', "products", "Failed");
                response.send('Unable to retrieve products data');
            } else if (result  === null) {
                logger.logDB('Get Product by ID', "products", "Failed");
                currentMessage = "No sale found with the given id";
                response.redirect('/products');
            } else {
                logger.logDB('Get Product by ID', "products");
                response.render('products-edit-form.hbs', {product: result, user: response.cookie.username})
            }
        });
    }
    else {
        currentMessage = "Please Login to view products";
        response.redirect('/Loginpage');
    }
});

app.listen(8080, () => {
    utils.init();
    console.log('Listening on port 8080');
});