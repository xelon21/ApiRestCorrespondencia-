const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = ( req, res = response, next ) => {

    console.log(req.header('x-api-key'), 'xapikey')
    console.log(req.header('apikey'), 'apikey')

    const apiKey =  req.header('x-api-key');     
    if( !apiKey ) {
        return res.status(401).json({
            Error: 'No tiene autorizacion'
        })
    }
    try {
        const {nombreUsuario, idRol, idUsuario} = jwt.verify( apiKey, process.env.JWT_SECRET );        
        req.nombreUsuario = nombreUsuario;
        req.idRol = idRol;
        req.idUsuario = idUsuario
    } catch (error) {
        return res.status(401).json({
            Error: 'Key no valida'
        })
    }
    
    // Si se valida
    next();
}

const validarAdmin = ( req, res = response, next ) => {
    const apiKey = req.header('x-api-key');
    if( !apiKey ) {
        return res.status(401).json({
            Error: 'No tiene permisos'
        })
    }    
    try {
        const { nombreUsuario, idRol, idUsuario } = jwt.verify( apiKey, process.env.JWT_SECRET );       
        req.nombreUsuario = nombreUsuario;
        req.idRol = idRol;     
        req.idUsuario = idUsuario;
        // console.log(idRol, nombreUsuario)   
        // if(req.idRol === 1 ) {
        //     console.log('entro xD')
        //         res.status(200).json({
        //         msg: ' Si posee permisos'
        //     })            
        // }
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            Error: 'Key no valida'
        })
    }

    next();
}

module.exports = {
    validarJWT,
    validarAdmin
}