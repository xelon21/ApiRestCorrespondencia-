const jwt = require('jsonwebtoken');


/** Metodo que genera un Json Web Token a partir del nombre de ususario y el id del rol */
const generarJWT = (nombreUsuario,  idRol) => {

    const payload = { nombreUsuario,  idRol };

    return new Promise( (resolve, reject) => {
        jwt.sign( payload, process.env.JWT_SECRET, {
            expiresIn: '8h',
            
        }, (error, token) => {
            if( error ) {
                console.log( error );
                reject(error)
            }else {
                resolve( token )
            } 
        })        
    }); 
}

/** Metodo que genera un Json Web Token a partir del nombre de ususario y el id del rol para administradores*/
const generarJWTAdmin = ( nombreUsuario, idRol ) => {
    const payload = { nombreUsuario, idRol };

    return new Promise ( ( resolve, reject ) => {
        jwt.sign( payload, process.env.JWT_SECRET, {
            expiresIn: '3h'
        }, ( error, token ) => {
            if( error ) {
                console.log( error );
                reject(error)
            }else {
                resolve( token )
            }
        })
    }); 
}


module.exports = {
    generarJWT,
    generarJWTAdmin
}