const { Router } = require('express');
const router = Router();
const { loginUsuario, registroUsuario, 
    validaApiKey, filtroUsuario,
    traeRoles, traeUsuario, validaApiKeyAdmin} = require('../controllers/login');
const { validarJWT, validarAdmin } = require('../middlewares/validar-jwt');




router.post('/login', loginUsuario);

router.post('/login/register', registroUsuario);

router.get('/login/validaKey', validarJWT , validaApiKey);

router.get('/login/validaAdmin', validarAdmin, validaApiKeyAdmin );

router.get('/login/traeRoles', traeRoles);

router.get('/login/traeUsuarios', traeUsuario);

router.get('/login/filtraUsuario/:nombreUsuario', filtroUsuario );




module.exports = router;