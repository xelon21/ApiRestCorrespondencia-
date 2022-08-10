import { Router } from 'express'
import { loginUsuario, registroUsuario,
         validaApiKey, validaApiKeyAdmin,
         filtroIdUsuario, traeRoles,
         traeUsuario, desactivarUsuario,
         modificarPassword, modificarUsuario } from '../controllers/login'
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt'

const { validateLogin } = require('../validators/login')
const router = Router();

router.post("/login", loginUsuario);

router.post('/login/register', registroUsuario);

router.get('/login/validaKey', validarJWT , validaApiKey);

router.get('/login/validaAdmin', validarAdmin, validaApiKeyAdmin );

router.get('/login/filtrarUsuariosModificar/:idUsuario', filtroIdUsuario);

router.get('/login/traeRoles', traeRoles);

router.get('/login/traeUsuarios', traeUsuario);

router.put('/login/modificarEstado/:idUsuario', desactivarUsuario)

router.put('/login/modificarPassword/:idUsuario', modificarPassword)

router.put('/login/modificar/:idUsuario', modificarUsuario)

export default router