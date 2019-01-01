'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var mysql = require('mysql');

var secret = 'secret_key_for_andresdev_store_ionic_app';

exports.ensure_auth_store = function(req, res, next) {
    res.set('Content-Type', 'application/json');
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Authorization header not set' });
    }

    if (!req.headers.user_id) {
        return res.status(403).send({ message: 'Userid header not set' });
    }

    let user_id = req.headers.user_id;
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment.unix()) {
            return res.status(401).send({ message: 'the token has expired' });
        }

        req.user = payload;

        // first select from users to see if user's email already exists
        let select_query = mysql.format('SELECT * FROM login WHERE id = ? AND token = ?', [user_id, token]);

        res.locals.connection.query(select_query, (err, users) => {
            if (err) {
                return res.status(500).send({ message: 'Error querying login table' });
            }
            if (users.length == 0) {
                return res.status(404).send({ message: 'User with token not found' });
            }

            next();

        });

    } catch {
        return res.status(404).send({ message: 'the token is not valid' });
    }


}