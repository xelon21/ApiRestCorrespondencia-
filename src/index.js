const express = require('express');
const app = express();
const cors = require('cors');

// configuraciones
app.set('port',process.env.PORT || 4000);

// middlewares
app.use(express.json());

//cors
app.use( cors() );

// rutass
app.use(require('./routes/correspondencia'));

// inicio de servidor
app.listen( app.get('port'), () => {
    console.log('Server en el puerto', app.get('port'));
});