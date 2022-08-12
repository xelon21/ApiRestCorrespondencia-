const { check } = require('express-validator');
const { validateResult } = require('../helpers/validateHelper')

/** validaciones de creacion de una correspondencia */
const validateCreate = [
    check('IdTIpoDocumento')
        .exists()
        .isNumeric()        
        .notEmpty(),
    check('IdTipoEnvio')
        .exists()
        .isNumeric()
        .notEmpty(),
    check('IdUsuario')
        .exists()
        .isNumeric()
        .notEmpty(),
    check('Destinatario')
        .exists()
        .isString()
        .notEmpty(),
    check('Referencia')
        .exists()
        .isString()  
        .notEmpty(),
    ( req, res, next ) => {
        validateResult( req, res, next );
    }
]

/** validaciones de la actualizacion de una correspondencia */
const validateUpdate = [    
    check('idTipoEnvio')
        .exists()
        .notEmpty()    
        .isNumeric(),
    check('destinatario')
        .exists()
        .notEmpty()
        .isString(),
    check('referencia')
        .exists()
        .notEmpty()
        .isString(), 
    check('correlativo')
        .exists()
        .notEmpty()
        .isString(),
    check('estadoCorreo')
        .exists()
        .notEmpty()
        .isString(),     
    ( req, res, next ) => {
        validateResult( req, res, next );
    }
]

module.exports = {
    validateCreate,
    validateUpdate
}