// Se importan los componentes a utilizar
const { Router } = require('express');
const router = Router();
const { mostrarCorrespondencia, muestraUltimo,
        muestraTipoEnvio, muestraTipoDocumento,
        filtroCorrelativo, buscarCorrelativoModificar,
        filtroRangoFechas, ingresarCorrespondencia,
        modificarCorrespondencia 
} = require('../controllers/correspondencia');

const { validateCreate, validateUpdate } = require('../validators/correspondencia')



router.get('/mostrar', mostrarCorrespondencia);

router.get('/mostrar/ultimo', muestraUltimo);

router.get('/mostrar/tipoenvio', muestraTipoEnvio);

router.get('/mostrar/tipodocumento', muestraTipoDocumento);

router.get('/filtro/:correlativo', buscarCorrelativoModificar);

router.get('/:correlativo', filtroCorrelativo);

router.get('/filtrar/:fechaInicio/:fechaTermino', filtroRangoFechas);

router.post('/ingresar', validateCreate, ingresarCorrespondencia);

router.put('/modificar/:correlativo', validateUpdate, modificarCorrespondencia);

/**[
    check('email', 'El email es obligatorio').isEmail().isEmpty(),
    check('password', 'El password no es correcto').isStrongPassword()
], */

module.exports = router;