const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
//const { mysqlConnection } = require('./database/database');
require('dotenv').config();


// Coneccion con la base de datos
//mysqlConnection();
// Helmet
app.use(helmet());

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
app.use('/api/correspondencia',require('./routes/login'));

// Manejas demas rutas
app.get('*', ( req, res ) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html' ))
})

// inicio de servidor
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${ process.env.PORT}`);
}); 
