const { response } = require('express');
const pool = require('../database/database');
const bcryptjs = require('bcryptjs');
const { promisify } = require('util'); 
const { generarJWT } = require('../helpers/jwt');

const loginUsuario = (req, res = response) => {

    try {
        const {email, password} = req.body
        
        if(!email || !password){
            res.json('Debe ingresar un usuario y contraseña')
        }else {
            pool.query('select * from usuarios where correoUsuario = ? ', [email], async (error, result) => {
                
                if(result.length === 0 || !(await bcryptjs.compare(password, result[0].password))){                    
                    res.json('Las credenciales no coinciden');                    
                }else {                    
                    
                    const token = await generarJWT( result[0].idUsuario, result[0].nombreUsuario );
                    
                    res.json({
                        estadoMsg: true,
                        msg: 'Se ha conectado con exito',
                        apiKey: token,
                        uid: result[0].idUsuario,
                        nombre: result[0].nombreUsuario,
                        estado: result[0].estado
                    });                                      
                }
            })
        }        
        
    } catch (error) {
        console.log(error)
    }
    //const errors = validationResult() 
}

const registroUsuario = async (req, res) => {

    const { idRol, email, password, nombreUsuario, estado } = req.body

    let hashPass = await bcryptjs.hash(password, 8)

    pool.query('insert into usuarios set ?',{ idRol: idRol, correoUsuario: email, password:hashPass, nombreUsuario:nombreUsuario, estado: estado},
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

module.exports = {
    loginUsuario,
    registroUsuario,
    validaApiKey
}