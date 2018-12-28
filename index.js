'use strict'

var app = require('./app');
var port = process.env.port || 3789;


app.listen(port, () => console.log(`Example app listening on port ${port}!`))