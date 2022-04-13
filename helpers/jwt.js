const jwt = require('jsonwebtoken');



const generarJWT = (idUsuario, nombreUsuario) => {

    const payload = { idUsuario, nombreUsuario };

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

const generarJWTAdmin = ( nombreUsuario, idRol ) => {
    const payload = { nombreUsuario, idRol };

    return new Promise ( ( resolve, reject ) => {
        jwt.sign( payload, process.env.JWT_SECRET_ADMIN, {
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