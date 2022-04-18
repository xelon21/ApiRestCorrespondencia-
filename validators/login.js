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

module.exports = {
    validateLogin
}