// // Importacion de componentes a utilizar
// const mysql = require('mysql');
// const { promisify } = require('util');
// const { database } = require('../keys');


// // Se establecen los pool con las conecciones a las bases de datos
// const pool = mysql.createPool(database);


// // Se crean los connection strings y dependiendo del error, este devuelve 
// // El error asociado

// /** GetConnection de la base de datos Correspondencia */
// pool.getConnection((err, conneccion) => {
//     if(err){
//         if(err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('LA CONECCION DE LA BASE DE DATOS FUE CERRADA');
//         }
//         if(err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('LA BASE DE DATOS TIENE DEMASIADAS CONECCIONES');
//         }
//         if(err.code === 'ECONNREFUSED') {
//             console.error('LA CONECCION FUE RECHAZADA')
//         }
//         console.log(err);
//         return;
//     } if(conneccion) conneccion.release();    
//      console.log('DB Correspondencia Conectado');
//      return;
// });
// // Se asigna promisify para poder generar async await a los pools
// pool.query = promisify(pool.query);

// // Se exportan la coneccion
// module.exports = pool;
