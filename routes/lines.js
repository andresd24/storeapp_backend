'use strict'

var express = require('express');
var api = express.Router();

var md_auth = require('../middlewares/authenticated');

var LinesController = require('../controllers/lines');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })


api.get('/lines', LinesController.get_lines);


module.exports = api;