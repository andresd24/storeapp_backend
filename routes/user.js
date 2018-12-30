'use strict'

var express = require('express');
var api = express.Router();

var md_auth = require('../middlewares/authenticated');

var UserController = require('../controllers/users');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })


api.get('/users', UserController.get_users);
api.get('/testing-controller', md_auth.ensureAuth, UserController.testing);
api.post('/register', UserController.register_user);
api.post('/login', UserController.login)
api.put('/update-user/:id', md_auth.ensureAuth, UserController.update_user)
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.upload_image)
api.get('/get-image-file/:imageFile', UserController.get_image_file);
api.get('/get-keepers', UserController.get_keepers);

module.exports = api;