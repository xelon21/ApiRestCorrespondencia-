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

module.exports = {
    validateLogin,
    validateRegistro
}