const { Router } = require('express');
const router = Router();
const { loginUsuario, registroUsuario, 
    validaApiKey, 
    traeRoles, traeUsuario} = require('../controllers/login');
const { validarJWT, validarAdmin } = require('../middlewares/validar-jwt');




router.post('/login', loginUsuario);

router.post('/login/register', registroUsuario);

router.get('/login/validaKey', validarJWT , validaApiKey);

router.get('/login/traeRoles', traeRoles);

router.get('/login/traeUsuarios', validarAdmin, traeUsuario)




module.exports = router;