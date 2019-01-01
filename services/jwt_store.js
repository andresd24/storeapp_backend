'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'secret_key_for_andresdev_store_ionic_app';


exports.create_token_store = function(user) {
    var payload = {
        id: user.id,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };

    return jwt.encode(payload, secret);

};