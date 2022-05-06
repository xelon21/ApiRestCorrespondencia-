const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const cors = require('cors');
const net = require('net');
const http = require('http');
const socketio = require('socket.io')



const server = http.createServer(app)
const io = socketio(server)

app.set('port', process.env.PORT || 3000)

require('./socket.js')(io, app)



server.on('connection', (socket) => {
  /** evento que recive los mensajes que se envian */
  socket.on('data', (data) => {
    console.log('\mensaje recibido desde el cliente:' + data) 
    socket.write('recibido')
      })

  socket.on('close', () => {
    console.log('comunicacion finalizada')
  })

  socket.on('error', (error) => {
    console.log(error.message)
  })
})



require('dotenv').config();

//Directorio Publico
app.use( express.static('public'));

//cors
app.use( cors() );

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Variables globales
app.use((req, res, next) => {
  next();
})

// Rutas
app.use('/api/correspondencia', 
  require('./routes/correspondencia'));
app.use('/api/correspondencia', 
  require('./routes/login'));

// Manejas demas rutas
app.get('*', ( req, res ) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html' ))
})

// inicio de servidor
// app.listen(app.get('port'), () => {
//   console.log(`Servidor corriendo en el puerto` + app.get('port'));
// })


app.listen( process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
}); 
