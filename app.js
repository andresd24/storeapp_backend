'use strict'

var mysql = require("mysql");
var express = require("express");
var bodyParser = require('body-parser');

//Database connection

var indexRouter = require('./routes/index');
var user_routes = require('./routes/user');

var app = express();

// load routes

// middleware for body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();

});
// middleware for mysql
app.use(function(req, res, next) {
    res.locals.connection = mysql.createConnection({
        host: 'localhost',
        user: 'zoo_user',
        password: 'kailini2K1',
        database: 'zoo_db'
    });
    //console.log(res.locals);
    res.locals.connection.connect();
    next();
});

app.get('/testing', (req, res) => {
    res.status(200).send({ message: 'this is the method testing' });
})

app.use('/api', user_routes)
    //app.use('/', indexRouter);
    //app.use('/users', usersRouter);


module.exports = app;