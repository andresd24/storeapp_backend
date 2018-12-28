'use strict'

var express = require('express');
var api = express.Router();
var UserController = require('../controllers/users');


/* GET home page. */
api.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


module.exports = api;