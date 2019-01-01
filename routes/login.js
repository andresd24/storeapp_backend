'use strict'

var express = require('express');
var api = express.Router();

var md_auth_store = require('../middlewares/authenticated_store');

var LoginController = require('../controllers/login');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })

api.get('/testing-controller', md_auth_store.ensure_auth_store, LoginController.testing);
api.post('/register', LoginController.register_user);
api.post('/login', LoginController.login)


module.exports = api;