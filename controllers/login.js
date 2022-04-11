const { response } = require('express');
const pool = require('../database/database');
const bcryptjs = require('bcryptjs');
const { promisify } = require('util'); 
const { generarJWT, generarJWTAdmin } = require('../helpers/jwt');
const { Console } = require('console');

const loginUsuario = (req, res = response) => {

    try {
        
        const {email, password} = req.body       
        
        if(!email || !password){
            res.json('Debe ingresar un usuario y contraseña')
        }else {
            pool.query('select * from usuarios where correoUsuario = ? ', [email], async (error, result) => {                                      
                if(result.length === 0 || !(await bcryptjs.compare(password, result[0].password))){                    
                    const token = await generarJWT( result[0].idUsuario, result[0].nombreUsuario );                    
                    res.json({
                        estadoMsg: true,
                        msg: 'Se ha conectado con exito',
                        apiKey: token,
                        uid: result[0].idUsuario,
                        idRol: result[0].idRol,                        
                        nombre: result[0].nombreUsuario,
                        estado: result[0].estado
                    });
                }else {                    
                    res.json('Las credenciales no coinciden');
                }
            })
        }        
        
    } catch (error) {
        console.log(error)
    }
    
}

const registroUsuario = async (req, res) => {

    const {idUsuario, idRol, email, password, nombreUsuario, estado } = req.body

    let hashPass = await bcryptjs.hash(password, 8)

    pool.query('insert into usuarios set ?',{idUsuario: idUsuario, idRol: idRol, correoUsuario: email, password:hashPass, nombreUsuario:nombreUsuario, estado: estado},
    (error, result) => {
        if(error){
            console.log(error)
            res.json('Error al ingresar el usuario')
        }
        res.json({
            estadoMsg: true,
            msg:'Usuario ingresado'})
    } )
}

const validaApiKey = async ( req, res ) => {    

    const { idUsuario, nombreUsuario } = req;    

    const apiKey = await generarJWT( idUsuario, nombreUsuario ) ;
   
    return res.json({
        estadoMsg: true,
        msg: 'Key Valida',
        uid: idUsuario,
        nombre: nombreUsuario,
        apiKey: apiKey
    })  
}

const traeRoles = async ( req, res ) => {

    await pool.query('select * from roles',(error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
}

const traeUsuario = async ( req, res ) => {
     await pool.query(' SELECT  idUsuario, nombreUsuario, r.rol FROM usuarios u join roles r on ( u.idRol = r.idRol)', (error, filas, campos) => {
        if(!error) {
            const { idUsuario, idRol } = req;    

            const apiKey = generarJWTAdmin( idUsuario, idRol ) ;
            console.log(filas)
        
            return res.json({
                estadoMsg: true,
                msg: 'Key Valida',
                uid: idUsuario,
                nombre: nombreUsuario,
                rol: rol,
                apiKey: apiKey
            })  
            
        }else {
            console.log(error);
        }
    })
} 

module.exports = {
    loginUsuario,
    registroUsuario,
    validaApiKey,
    traeRoles,
    traeUsuario
}
















// if(result[0].idRol === 1 ){   
//     const token = await generarJWTAdmin( result[0].idUsuario, result[0].idRol );
//     console.log('3 paso por aca')
//     res.json({
//         estadoMsg: true,
//         msg: 'Se ha conectado con exito',
//         apiKey: token,
//         uid: result[0].idUsuario,
//         idRol: result[0].idRol,                        
//         nombre: result[0].nombreUsuario,
//         estado: result[0].estado
//     });   
// }