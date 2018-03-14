var mysql = require("mysql");
var config = require("./config").dev;

var pool = mysql.createPool({
    connectionLimit : config.connectionLimit,
    host: config.host,
    user: config.user,
    port: config.port,
    password: config.password,
    database: config.database
});

exports.pool = pool;
