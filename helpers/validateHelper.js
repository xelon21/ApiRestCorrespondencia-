const { validationResult } = require('express-validator');

/** Metodo que se ocupa para validar campos antes 
 * de ingresar al controlador */
const validateResult = ( req, res, next ) => {
    try {
        validationResult(req).throw()
        return next()        
    } catch (error) {
        res.status(403)
        res.send({ errors: error.array() })
    }
}

module.exports = {
    validateResult
}