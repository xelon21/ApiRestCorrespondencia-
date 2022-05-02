const { check } = require('express-validator');
const { validateResult } = require('../helpers/validateHelper')

/**  validaciones del login de un usuario */
const validateLogin = [
    check('email')
        .exists()
        .isEmail()
        .notEmpty(),
    check('password')
        .exists()
        .isStrongPassword()
        .notEmpty(),
    ( req, res, next ) => {
        validateResult( req, res, next );
    }
]

/** Validaciones del registro de un usuario */
const validateRegistro = [
    check('idRol')
        .exists()
        .isNumeric()
        .notEmpty(),
    check('email')
        .exists()
        .isEmail()
        .notEmpty(),
    check('password')
        .exists()
        .isStrongPassword()
        .notEmpty(),
    check('nombreUsuario')
        .exists()
        .isString()        
        .notEmpty(),
    check('estado')
        .exists()
        .isBoolean(),       
    check('activacionUsuario')
        .isString(),
    check('desactivacionUsuario')
        .isString()   
]

// /** Validaciones de contraseñas para el metodo que permite cambiar la contraseña */
// const validaPassword = [
//     check('password')
//         .exists()
//         .isStrongPassword()
//         .notEmpty(),
//     check('password2')
//         .exists()
//         .isStrongPassword()
//         .notEmpty()
// ]

module.exports = {
    validateLogin,
    validateRegistro,
    
}