'use strict'

var bcrypt = require('bcrypt-nodejs');

var jwt = require('../services/jwt');

var mysql = require('mysql');

function register_user(req, res) {

    var params = req.body;

    let name = params.name;
    let surname = params.surname;
    let email = params.email;
    let role = 'ROLE_USER';
    let image = "";

    console.log('registering user');

    if (params.password && params.name && params.surname && params.email) {
        // first select from users to see if user's email already exists
        let select_query = "SELECT * FROM users where email='" + email + "'";

        res.locals.connection.query(select_query, (err, result) => {
            res.set('Content-Type', 'application/json');
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                return res.status(404).send({ message: 'User already exists' });

            } else {

                bcrypt.hash(params.password, null, null, function(err, hash) {
                    let insert_query = "INSERT INTO users (`name`, `surname`, `email`, `password`, `image`, `role`) VALUES ('" +
                        name + "', '" + surname + "', '" + email + "', '" + hash + "', '" + image + "', '" + role + "')";

                    console.log(insert_query);
                    res.locals.connection.query(insert_query, (err, result) => {

                        if (err) {
                            res.set('Content-Type', 'application/json');
                            return res.status(500).send({ message: 'Error registering user ' + result });
                        }

                        let select_query = "SELECT * FROM users where email='" + email + "'";

                        res.locals.connection.query(select_query, (err, userStored) => {
                            res.set('Content-Type', 'application/json');
                            if (err) {
                                return res.status(500).send({ message: 'Error registering user' });
                            } else {
                                if (userStored.length == 0) {
                                    return res.status(404).send({ message: 'User was not registered' });
                                }
                                return res.status(200).send(JSON.stringify({ user: userStored[0] }));
                            }
                        });

                    });

                })
            }

        })
    } else {
        res.set('Content-Type', 'application/json');
        return res.status(200).send({ message: 'Introduce the fields correctly' });
    }
}

function login(req, res) {
    var params = req.body;

    let name = params.name;
    let surname = params.surname;
    let email = params.email;
    let password = params.password;

    // first select from users to see if user's email already exists
    let select_query = "SELECT * FROM users where email='" + email + "'";

    res.locals.connection.query(select_query, (err, users) => {
        res.set('Content-Type', 'application/json');
        if (err) {
            return res.status(500).send({ message: 'Error querying user table' });
        }
        if (users.length == 0) {
            return res.status(404).send({ message: 'User not found' });
        } else {
            bcrypt.compare(password, users[0].password, (err, check) => {
                if (check) {

                    if (params.gettoken) {

                        return res.status(200).send(JSON.stringify({ token: jwt.create_token(users[0]) }));
                    } else {
                        return res.status(200).send(JSON.stringify({ user: users[0] }));

                    }
                } else {
                    return res.status(404).send({ message: 'User could not log in' });
                }
            });

        }

    });

}

function get_users(req, res) {
    res.locals.connection.query('SELECT * from users', function(error, users, fields) {
        if (error) throw error;
        res.set('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify({ users }));
    });
}

function update_user(req, res) {
    var user_id = req.params.id;

    if (user_id != req.user.sub) {
        res.set('Content-Type', 'application/json');
        return res.status(500).send({ message: "You don't have permissions to update this user" });
    }

    var user = req.body;
    let update_query = mysql.format('UPDATE users SET ? WHERE ?', [user, { id: user_id }]);

    res.locals.connection.query(update_query, (err, users) => {
        res.set('Content-Type', 'application/json');
        if (err) {
            return res.status(500).send({ message: 'Error udpating user' });
        }
        let select_query = "SELECT * FROM users where id='" + user_id + "'";

        res.locals.connection.query(select_query, (err, userStored) => {
            res.set('Content-Type', 'application/json');
            if (err) {
                return res.status(500).send({ message: 'Error registering user' });
            } else {
                if (userStored.length == 0) {
                    return res.status(404).send({ message: 'User was not registered' });
                }
                return res.status(200).send(JSON.stringify({ user: userStored[0] }));
            }
        });
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
    get_users,
    login,
    update_user
};