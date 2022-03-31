const { Router } = require('express');
const router = Router();
const { loginUsuario, registroUsuario, 
    validaApiKey, 
    traeRoles} = require('../controllers/login');
const { validarJWT } = require('../middlewares/validar-jwt');




router.post('/login',  loginUsuario);

router.post('/login/register', registroUsuario);

router.get('/login/validaKey', validarJWT , validaApiKey);

router.get('/login/traeRoles', traeRoles);




module.exports = router;