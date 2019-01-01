'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt_store = require('../services/jwt_store');
var mysql = require('mysql');

function register_user(req, res) {

    var params = req.body;

    if (params.password && params.email) {

        let email = params.email;
        let password = params.password;
        // first select from users to see if user's email already exists
        let select_query = mysql.format('SELECT * FROM login WHERE ?', [{ email: email }]);


        res.locals.connection.query(select_query, (err, result) => {
            res.set('Content-Type', 'application/json');
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                return res.status(404).send({ 'error': true, message: 'User already exists' });

            } else {

                bcrypt.hash(password, null, null, function(err, hash) {

                    var user_to_insert = { email: email, password: hash };

                    let insert_query = mysql.format('INSERT INTO login SET ?', user_to_insert);
                    res.locals.connection.query(insert_query, (err, result) => {

                        if (err) {
                            return res.status(500).send({ 'error': true, message: 'Error registering user ' + result });
                        }

                        let select_query = mysql.format('SELECT * FROM login WHERE ?', [{ email: email }]);

                        res.locals.connection.query(select_query, (err, userStored) => {
                            if (err) {
                                return res.status(500).send({ 'error': true, message: 'Error registering user' });
                            } else {
                                if (userStored.length == 0) {
                                    return res.status(404).send({ 'error': true, message: 'User was not registered' });
                                }
                                return res.status(200).send({ 'error': false, user: userStored[0] });
                            }
                        });

                    });

                })
            }

        })
    } else {
        res.set('Content-Type', 'application/json');
        return res.status(200).send({ 'error': true, message: 'Introduce the fields correctly' });
    }
}

function login(req, res) {
    var params = req.body;

    let email = params.email;
    let password = params.password;

    // first select from users to see if user's email already exists
    let select_query = mysql.format('SELECT * FROM login WHERE ?', [{ email: email }]);

    res.locals.connection.query(select_query, (err, users) => {
        if (err) {
            return res.status(500).send({ 'error': true, message: 'Error querying user table' });
        }
        if (users.length == 0) {
            return res.status(404).send({ 'error': true, message: 'User not found' });
        } else {
            bcrypt.compare(password, users[0].password, (err, check) => {
                if (check) {
                    let token = jwt_store.create_token_store(users[0]);
                    let update_query = mysql.format('UPDATE login SET ? WHERE ?', [{ token: token }, { id: users[0].id }]);
                    let id = users[0].id;
                    res.locals.connection.query(update_query, (err, users) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error udpating token' });
                        }

                        return res.status(200).send({
                            'error': false,
                            'token': token,
                            'id': id
                        });
                        /*    
                        if (params.gettoken) {
                            return res.status(200).send({ 'error': false, token: token });
                        } else {
                            return res.status(200).send({ 'error': false, user: users[0] });

                        }*/
                    });

                } else {
                    return res.status(404).send({ 'error': true, message: 'User could not log in' });
                }
            });

        }

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
    register_user,
    login
};