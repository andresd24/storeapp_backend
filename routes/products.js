'use strict'

var express = require('express');
var api = express.Router();

var md_auth = require('../middlewares/authenticated');

var ProductController = require('../controllers/products');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' })


api.get('/products/all/:page', ProductController.get_products);
api.get('/products/line/:line/:page', ProductController.get_products_by_line);
api.get('/products/search/:query', ProductController.search_products);



module.exports = api;