'use strict'

var express = require('express');
var api = express.Router();

var md_auth_store = require('../middlewares/authenticated_store');

var OrderController = require('../controllers/orders');


api.get('/orders/testing-controller', md_auth_store.ensure_auth_store, OrderController.testing);
api.post('/orders/create-order', md_auth_store.ensure_auth_store, OrderController.create_order);
api.get('/orders/get-user-orders', md_auth_store.ensure_auth_store, OrderController.get_user_orders);
api.get('/orders/get_user_order_by_id/:order_id', md_auth_store.ensure_auth_store, OrderController.get_user_order_by_id);



module.exports = api;