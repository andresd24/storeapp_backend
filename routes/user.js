'use strict'

var express = require('express');
var api = express.Router();

var md_auth = require('../middlewares/authenticated');

var UserController = require('../controllers/users');


api.get('/users', UserController.get_users);
api.get('/testing-controller', md_auth.ensureAuth, UserController.testing);
api.post('/register', UserController.register_user);
api.post('/login', UserController.login)
api.put('/update-user/:id', md_auth.ensureAuth, UserController.update_user)

module.exports = api;