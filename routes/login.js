const { Router } = require('express');
const router = Router();
const { loginUsuario, registroUsuario, 
    validaApiKey, filtroUsuario,
    traeRoles, traeUsuario, validaApiKeyAdmin,
    modificarUsuario, filtroIdUsuario,
    modificarPassword, desactivarUsuario,
    } = require('../controllers/login');
const { validarJWT, validarAdmin } = require('../middlewares/validar-jwt');
const { validateLogin, validateRegistro } = require('../validators/login') 



router.post('/login', validateLogin,  loginUsuario);

router.post('/login/register', validateRegistro, registroUsuario);

router.get('/login/validaKey', validarJWT , validaApiKey);

router.get('/login/validaAdmin', validarAdmin, validaApiKeyAdmin );

router.get('/login/traeRoles', traeRoles);

router.get('/login/traeUsuarios', traeUsuario);

router.get('/login/filtraUsuario/:nombreUsuario', filtroUsuario );

router.get('/login/filtrarUsuariosModificar/:idUsuario', filtroIdUsuario)

router.put('/login/modificarPassword/:idUsuario', modificarPassword)

router.put('/login/modificarEstado/:idUsuario', desactivarUsuario)

router.put('/login/modificar/:idUsuario', modificarUsuario)




module.exports = router;