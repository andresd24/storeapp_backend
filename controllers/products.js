'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');


function get_products(req, res) {
    var page = req.params.page;
    var offset = 0;

    if (page != undefined) {
        if (page != 1) {
            offset = (page - 1) * 10;
        }
    } else {
        return res.status(500).send({ 'error': true, message: 'please specify page number' });
    }

    var select_query = mysql.format('SELECT * FROM `products` LIMIT ? OFFSET ?', [10, offset])

    res.locals.connection.query(select_query, function(error, products, fields) {
        if (error) {
            return res.status(500).send({ 'error': true, message: 'error getting products' });
        }
        return res.status(200).send({ 'error': false, 'products': products });
    });
}

function get_products_by_line(req, res) {
    let m_line = 0;
    let offset = 0;
    let page = req.params.page;
    m_line = req.params.line;

    if (page != undefined) {
        if (page != 1) {
            offset = (page - 1) * 10;
        }
    } else {
        return res.status(500).send({ 'error': true, message: 'please specify page number' });
    }

    if (m_line == undefined || m_line <= 0 || m_line > 7) {
        return res.status(500).send({ 'error': true, message: 'please specify correct line' });
    }

    let select_query = mysql.format('SELECT * FROM `products`  WHERE ? LIMIT ? OFFSET ?', [{ line_id: m_line }, 10, offset])
    res.locals.connection.query(select_query, function(error, products, fields) {
        if (error) {
            return res.status(500).send({ 'error': true, message: 'error getting products' });
        }
        return res.status(200).send({ 'error': false, 'products': products });
    });
}

function search_products(req, res) {
    let query = req.params.query;
    let escaped_query = '%' + query + '%'

    let select_query = mysql.format('SELECT * FROM `products` WHERE product LIKE ?', escaped_query)
        // to search multiple columns replace the select_query being used by this one:
        //  let select_query = mysql.format('SELECT * FROM `products` WHERE CONCAT (product, line, provider, description) LIKE ?', esc_query)
    res.locals.connection.query(select_query, function(error, products) {
        if (error) {
            return res.status(500).send({ 'error': true, message: 'error getting products' });
        }
        return res.status(200).send({ 'error': false, query: query, 'products': products });
    });
}

function testing(req, res) {

    res.status(200).send({
        message: 'testing the user controller testing method',
        user: req.user
    })
}


module.exports = {
    testing,
    get_products,
    get_products_by_line,
    search_products
};