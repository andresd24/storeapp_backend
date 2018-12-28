'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'secret_key_for_mysql_nodejs_api';

exports.ensureAuth = function(req, res, next) {
    res.set('Content-Type', 'application/json');
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Authorization header not set' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment.unix()) {
            return res.status(401).send({ message: 'the token has expired' });
        }
    } catch {
        return res.status(404).send({ message: 'the token is not valid' });
    }

    req.user = payload;
    next();

}