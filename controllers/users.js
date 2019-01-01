'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');

function register_user(req, res) {

    var params = req.body;

    let name = params.name;
    let surname = params.surname;
    let email = params.email;
    let role = 'ROLE_USER';
    let image = "";

    console.log('registering user1');

    if (params.password && params.name && params.surname && params.email) {
        // first select from users to see if user's email already exists
        let select_query = mysql.format('SELECT * FROM users WHERE ?', [{ email: email }]);


        res.locals.connection.query(select_query, (err, result) => {
            res.set('Content-Type', 'application/json');
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                return res.status(404).send({ message: 'User already exists' });

            } else {

                bcrypt.hash(params.password, null, null, function(err, hash) {

                    var user_to_insert = { name: name, surname: surname, email: email, password: hash, image: image, role: role };

                    let insert_query = mysql.format('INSERT INTO users SET ?', user_to_insert);
                    res.locals.connection.query(insert_query, (err, result) => {

                        if (err) {
                            return res.status(500).send({ message: 'Error registering user ' + result });
                        }

                        let select_query = mysql.format('SELECT * FROM users WHERE ?', [{ email: email }]);

                        res.locals.connection.query(select_query, (err, userStored) => {
                            if (err) {
                                return res.status(500).send({ message: 'Error registering user' });
                            } else {
                                if (userStored.length == 0) {
                                    return res.status(404).send({ message: 'User was not registered' });
                                }
                                return res.status(200).send({ user: userStored[0] });
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
    let select_query = mysql.format('SELECT * FROM users WHERE ?', [{ email: email }]);

    res.locals.connection.query(select_query, (err, users) => {
        if (err) {
            return res.status(500).send({ message: 'Error querying user table' });
        }
        if (users.length == 0) {
            return res.status(404).send({ message: 'User not found' });
        } else {
            bcrypt.compare(password, users[0].password, (err, check) => {
                if (check) {

                    if (params.gettoken) {

                        return res.status(200).send({ token: jwt.create_token(users[0]) });
                    } else {
                        return res.status(200).send({ user: users[0] });

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
        return res.status(200).send({ users });
    });
}

function update_user(req, res) {
    var user_id = req.params.id;

    console.log(user_id);
    console.log(req.user.sub);
    if (user_id != req.user.sub) {
        return res.status(500).send({ message: "You don't have permissions to update this user" });
    }

    var user = req.body;
    let update_query = mysql.format('UPDATE users SET ? WHERE ?', [user, { _id: user_id }]);

    console.log(update_query);
    res.locals.connection.query(update_query, (err, users) => {
        if (err) {
            return res.status(500).send({ message: 'Error udpating user' });
        }

        let select_query = mysql.format('SELECT * FROM users WHERE ?', [{ _id: user_id }]);
        res.locals.connection.query(select_query, (err, userStored) => {
            if (err) {
                return res.status(500).send({ message: 'Error registering user' });
            } else {
                if (userStored.length == 0) {
                    return res.status(404).send({ message: 'User was not registered' });
                }
                return res.status(200).send({ user: userStored[0] });
            }
        });
    });
}

function upload_image(req, res) {
    var user_id = req.params.id;
    var file_name = "not uploaded...";

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split("/");
        var file_name = file_split[2];

        var ext_split = file_name.split("\.");
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            if (user_id != req.user.sub) {
                return res.status(500).send({ message: "You don't have permissions to update this user" });
            }

            let update_query = mysql.format('UPDATE users SET ? WHERE ?', [{ image: file_name }, { _id: user_id }]);
            res.locals.connection.query(update_query, (err, users) => {
                if (err) {
                    return res.status(500).send({ message: 'Error udpating user' });
                }

                let select_query = mysql.format('SELECT * FROM users WHERE ?', [{ _id: user_id }]);
                res.locals.connection.query(select_query, (err, userStored) => {
                    if (err) {
                        return res.status(500).send({ message: 'Error registering user' });
                    } else {
                        if (userStored.length == 0) {
                            return res.status(404).send({ message: 'User was not registered' });
                        }
                        return res.status(200).send({ user: userStored[0], image: file_name });
                    }
                });
            });

        } else {
            fs.unlink(file_path, (err) => {
                if (err) {
                    return res.status(200).send({ message: 'file extention not valid and file not downloaded' });
                } else {
                    return res.status(200).send({ message: 'file extention not valid' });
                }
            });
        }
        console.log(file_name);

    } else {
        return res.status(200).send({ message: 'No files were uploaded' });
    }

}

function get_image_file(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, function(exists) {
        if (exists) {
            return res.sendFile(path.resolve(path_file));
        } else {
            return res.status(404).send({ message: "image doesn't exist" });
        }
    });
}

function get_keepers(req, res) {
    let select_query = mysql.format('SELECT * FROM users WHERE ?', [{ role: 'ROLE_ADMIN' }]);

    res.locals.connection.query(select_query, (err, users) => {
        if (err) {
            return res.status(500).send({ message: 'Error getting keepers from db' });
        } else {
            if (users.length == 0) {
                return res.status(404).send({ message: 'No users found' });
            }
            return res.status(200).send({ users });
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
    get_users,
    login,
    update_user,
    upload_image,
    get_image_file,
    get_keepers
};