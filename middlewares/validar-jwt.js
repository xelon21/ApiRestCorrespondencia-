const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = ( req, res = response, next ) => {

    const apiKey =  req.header('x-api-key');
    console.log(apiKey)
    if( !apiKey ) {
        return res.status(401).json({
            Error: 'No tiene autorizacion'
        })
    }
    try {
        const { idUsuario, nombreUsuario } = jwt.verify( apiKey, process.env.JWT_SECRET );
        req.idUsuario = idUsuario;
        req.nombreUsuario = nombreUsuario;
    } catch (error) {
        return res.status(401).json({
            Error: 'Key no valida'
        })
    }
    
    // Si se valida
    next();
}


module.exports = {
    validarJWT
}