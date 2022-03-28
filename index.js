const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
//const { mysqlConnection } = require('./database/database');
require('dotenv').config();


// Coneccion con la base de datos
//mysqlConnection();

//Directorio Publico
app.use( express.static('public'));

//cors
app.use( cors() );

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Variables globales
app.use((req, res, next) => {
    next();
})

// Rutas
app.use('/api/correspondencia',require('./routes/correspondencia'));
//app.use(require('./routes/correspondencia'));

// inicio de servidor
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${ process.env.PORT}`);
}); 
