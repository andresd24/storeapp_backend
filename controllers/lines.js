'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');


function get_lines(req, res) {
    res.locals.connection.query('SELECT * FROM `lines`', function(error, lines, fields) {
        if (error) throw error;
        return res.status(200).send({ 'error': false, 'lines': lines });
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
    get_lines
};