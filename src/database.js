const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Blackheart5469',
    database: 'correspondencia'
});


mysqlConnection.connect(function (err){
    if(err){
        console.log(err);
        return;
    } else {
        console.log('DB Conectado');
    }
});

module.exports = mysqlConnection;