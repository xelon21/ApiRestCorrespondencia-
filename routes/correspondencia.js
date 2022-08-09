import { Router } from 'express'
import { ingresarCorrespondencia, mostrarCorrespondencia,
         modificarCorrespondencia, muestraUltimo,
         muestraTipoEnvio, muestraTipoDocumento,
         buscarCorrelativoModificar, filtroRangoFechas,
         filtroCorrelativo } from '../controllers/correspondencia'

const { validateCreate } = require('../validators/correspondencia')
const router = Router();

router.get("/mostrar", mostrarCorrespondencia);

router.post("/ingresar", validateCreate, ingresarCorrespondencia);

router.put('/modificar/:correlativo', modificarCorrespondencia );

router.get('/mostrar/ultimo', muestraUltimo);

router.get('/mostrar/tipoenvio', muestraTipoEnvio);

router.get('/mostrar/tipodocumento', muestraTipoDocumento);

router.get('/filtro/:correlativo', buscarCorrelativoModificar);

router.get('/filtrar/:fechaInicio/:fechaTermino', filtroRangoFechas);

router.get('/:correlativo', filtroCorrelativo);

export default router