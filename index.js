const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const cors = require('cors');


import correspondencia from './routes/correspondencia'
import login from './routes/login'


app.use(express.json());
app.use(express.urlencoded({
   extended: true 
  }));

app.use('/api/correspondencia',correspondencia);
app.use('/api/correspondencia',login )

require('dotenv').config();

//Directorio Publico
app.use( express.static('public'));


//cors
app.use( cors() );

// middlewares
app.use(morgan('dev'));


// Variables globales
app.use((req, res, next) => {
  next();
})

// Rutas
// app.use('/api/correspondencia', 
//   require('./routes/correspondencia'));
// app.use('/api/correspondencia', 
//   require('./routes/login'));

// Manejas demas rutas
app.get('*', ( req, res ) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html' ))
})

app.listen( process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`);
});


//inicio de servidor
// app.listen(app.get('port'), () => {
//   console.log(`Servidor corriendo en el puerto: ` + app.get('port'));
// })
