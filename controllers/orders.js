'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt_store = require('../services/jwt_store');
var mysql = require('mysql');
var async = require('async');

function create_order(req, res) {

    var params = req.body;
    let items_string = params.items;

    if (items_string == undefined || items_string.length == 0) {
        return res.status(500).send({ 'error': true, 'message': 'missing items in post' });
    }


    let items = items_string.split(',');
    let user_id = req.headers.user_id;
    let order_id = -1;

    let insert_query = mysql.format('INSERT INTO orders SET ?', { user_id: user_id });

    res.locals.connection.query(insert_query, (err, order) => {
        if (err) {
            return res.status(500).send({ 'error': true, 'message': 'error creating order' });
        }

        order_id = order.insertId;

        items.forEach(item => {

            var order_details = { order_id: order_id, product_id: item };
            let order_insert_query = mysql.format('INSERT INTO orders_details SET ?', order_details);
            res.locals.connection.query(order_insert_query, (err, result) => {

                if (err) {
                    return res.status(500).send({ message: 'Error creating order details ' + result });
                }
            });

        });
        return res.status(200).send({ 'error': false, 'order_id': order.insertId });

    });

}


function calculate(x) {
    x = x.toString() + "abc";
    return x;
}

function calculate_order(order, res) {
    let select_order_query = mysql.format('SELECT od.order_id, p.* FROM `orders_details` od INNER JOIN products p ON od.product_id = p.code WHERE ?', { order_id: order.id });
    res.locals.connection.query(select_order_query, function(err, order_details) {
        console.log('inside mysql callback order_details to orders');
        if (err) {
            return res.status(500).send({ message: 'Error querying orders_details table' });
        }



    });
}


var result = [];
var getInformationFromDB = function(res, user_id, order_id, callback) {
    let select_query = mysql.format('SELECT * FROM orders WHERE user_id = ? AND id = ?', [user_id, order_id]);
    res.locals.connection.query(select_query, (err, res, fields) => {
        if (err)
            return callback(err);
        if (res.length) {
            for (var i = 0; i < res.length; i++) {
                result.push(res[i]);
            }
        }
        callback(null, result);
    });
};

var getOrderDetails = function(res, user_id, order_id, callback) {
    let select_query = mysql.format('SELECT * FROM orders WHERE user_id = ? AND id', [user_id, order_id]);
    res.locals.connection.query(select_query, (err, orders, fields) => {
        if (err)
            return callback(err);

        let select_order_query = mysql.format('SELECT od.order_id, p.* FROM `orders_details` od INNER JOIN products p ON od.product_id = p.code WHERE ?', { order_id: order_id });

        res.locals.connection.query(select_order_query, (err, res, fields) => {
            if (err)
                return callback(err);
            if (res.length) {
                var m_order = {
                    'id': order_id,
                    'created_in': 'abc',
                    'details': res
                };

                result.push(m_order);
                //console.log(result);
            }
            callback(null, result);
        });

    });
}

var getOrderDetailsFromDB = function(res, user_id, callback) {
    let select_query = mysql.format('SELECT * FROM orders WHERE user_id = ?', [user_id]);

    res.locals.connection.query(select_query, function(err, orders, fields) {
        if (err)
            return callback(err);
        if (orders.length) {
            for (var i = 0; i < orders.length; i++) {
                result.push(orders[i]);
            }
        }
        callback(null, result);
    });

}


//function get_user_order_by_id(req, res) {
function get_user_order_by_id(user_id, order_id, res) {

    //    var params = req.params;
    //    let order_id = params.order_id;
    //let user_id = req.headers.user_id;
    console.log("Call Function");
    getOrderDetails(res, user_id, order_id, function(err, result) {
        if (err) console.log("Database error!");
        else console.log(result);
    });

    /*
    let select_query = mysql.format('SELECT * FROM orders WHERE user_id = ? AND id = ?', [user_id, order_id]);

    console.log(select_query);
    res.locals.connection.query(select_query, (err, orders) => {
        if (err) {
            return false; // res.status(500).send({ message: 'Error querying orders table' });
        }
        console.log(orders);

        var order = orders[0];

        let select_order_query = mysql.format('SELECT od.order_id, p.* FROM `orders_details` od INNER JOIN products p ON od.product_id = p.code WHERE ?', { order_id: order.id });
        res.locals.connection.query(select_order_query, function(err, order_details) {
            console.log('inside mysql callback order_details to orders');
            if (err) {
                return res.status(500).send({ message: 'Error querying orders_details table' });
            }

            var m_order = {
                'id': order.id,
                'created_in': order.created_in,
                'details': order_details
            };
            console.log(m_order);

            return m_order;
            //            return m_order;
            //return res.status(200).send({ 'error': false, 'order': m_order });
        });
    });
    */

}

function get_user_orders(req, res) {

    let user_id = req.headers.user_id;

    let select_query = mysql.format('SELECT * FROM orders WHERE ?', { user_id: user_id });

    res.locals.connection.query(select_query, (err, orders) => {
        if (err) {
            return res.status(500).send({ message: 'Error querying orders table' });
        }

        let results = orders.map(function(order) {
            getOrderDetails(res, user_id, order.id, (err, result) => {
                console.log("logging result = " + result);
                return result;
            })

            //var m_orders = orders.map(order => get_user_order_by_id(order.user_id, order.id, res));

        });
        return res.status(200).send({ results });

    });
}

function get_order(user_id, res, callback) {

    let select_query = mysql.format('SELECT * FROM orders WHERE ?', { user_id: user_id });

    res.locals.connection.query(select_query, (err, orders) => {
        if (err) {
            callback(err, null);
        }
        let m_orders = [];

        for (var i = 0; i < orders.length; i++) {
            get_order_details(order, res, function(err, order_details) {
                //console.log(order_details);
                var m_order = {
                    'id': order.id,
                    'created_in': order.created_in,
                    'details': order_details
                };


            });
        }

        callback(null, m_orders);
    });

}
/*
function get_order_details(order, res, callback) {
    let select_order_query = mysql.format('SELECT od.order_id, p.* FROM `orders_details` od INNER JOIN products p ON od.product_id = p.code WHERE ?', { order_id: order.id });

    res.locals.connection.query(select_order_query, function(err, order_details) {
        if (err)
            callback(err, null);
        else {
            var m_order = {
                'id': order.id,
                'created_in': order.created_in,
                'details': order_details
            };

            callback(null, m_order);
        }

    });

}
*/



function testing(req, res) {
    res.status(200).send({
        message: 'testing the user controller testing method',
        user: req.user
    })
}


module.exports = {
    testing,
    create_order,
    get_user_orders,
    get_user_order_by_id
};