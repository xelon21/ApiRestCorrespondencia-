const { response } = require('express');
const pool = require('../database/database');
const bcryptjs = require('bcryptjs');
const { generarJWT, generarJWTAdmin } = require('../helpers/jwt');


/** Metodo que permite el logueo de un usuario */
const loginUsuario = (req, res = response) => {

    try {
        // se extraen los parametros del body        
        const {email, password} = req.body  
        console.log(email, password)     
        
        // se valida que el email y el password no vengan vacios
        if(!email || !password){
            res.json('Debe ingresar un usuario y contraseña')
        }else {

            
            // se ejecuta query en mysql de todos los datos del usuario segun su nombre de usuario una vez paso la validacion anterior
            pool.query('select idUsuario, idRol, correoUsuario, password, nombreUsuario, estado from usuarios where correoUsuario = ? ', [email], async (error, result) => {


                // se corrobora que la password coincida con la que se encuentra en la base de datos                               
                if(!result.length === 0 || (await bcryptjs.compare(password, result[0].password))){   

                    // se genera el json web token 
                    const token = await generarJWT( result[0].nombreUsuario, result[0].idRol );

                    // se envia mensaje de respuesta 
                    res.json({
                        estadoMsg: true,
                        msg: 'Se ha conectado con exito',
                        apiKey: token,
                        uid: result[0].idUsuario,
                        email: result[0].correoUsuario,
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

/** Metodo que permite filtrar usuarios mediante su nombre de usuario
 *  [ esta opcion solo puede ocuparla el administrador en su respectiva ventana ]
 */
const filtroUsuario = async ( req, res ) => {
    // se extraen los parametros de la request
    const { nombreUsuario } = req.params;    

    try {
        // se genera una constante query con el procedimiento de 
        //almacenado que filtra por nombre de usuario
        const query = ` CALL SP_FILTRAUSUARIO( ? );`
        
        // se ejecuta la query para posteriormente enviar una 
        // respuesta si encuentra o no encuentra al usuario filtrado
        await pool.query(query, [ nombreUsuario ],
        ( error, filas, campos ) => {
            if(!error) {
                res.json(filas[0]);
            } else {
                res.json({
                    msg: 'no hay nada'
                })
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
             Error: error,
             msg: 'Usuario no existe'
        })
    }
   
}

/** Metodo que permite registrar un usuario
 * [ Esta opcion solo se encuentra en el panel de administracion ]
 */
const registroUsuario = async (req, res) => {

    // se extraen  los datos del body
    const { idRol, email, password, nombreUsuario, estado, fech1, fech2 } = req.body   
    const query = `        
        CALL SP_REGISTROUSUARIO( ?, ?, ?, ?, ?, ?, ? );
    `;  
    let existe = false  
    
    try {
        // se genera el hash de la contraseña para postariormente almacenarla en la base de datos
        let hashPass = await bcryptjs.hash(password, 8)
        await pool.query('select nombreUsuario, correoUsuario from usuarios', (error, filas, campos) =>{      
            if(error){
                console.log(error)                
            }else {
                console.log(  idRol, email, password, nombreUsuario, estado, fech1, fech2 )
                filas.forEach(element => {
                  if(element.nombreUsuario === nombreUsuario || element.correoUsuario === email){ 
                      existe = true;                                       
                  }                 
                });
                 // se ejecuta la query para ingresar el usuario a la base de datos y dependiendo del resultado, envia su respuesta respectiva
                 pool.query( query ,[ idRol, email, hashPass, nombreUsuario, estado, fech1, fech2 ],
                    (error, filas, campos) => {                        
                        if( existe ){                
                        res.json({
                            estadoMsg: false,
                            msg: 'Error al ingresar el usuario'
                        })
                        existe = false;                        
                        }else if(!existe) {
                            res.json({
                                estadoMsg: true,
                                msg:'Usuario ingresado'})                              
                        }
                     })
            }      
         })
        }catch (error) {
                console.log(error)
                res.status(401).json({
                    Error: error,
                    msg: 'Ha ocurrido un error'
                })
        }        
}

/** Metodo que permite validar el token de un usuario al ingresarse y volver a autenticarlo */
const validaApiKey = async ( req, res ) => {    

    // se extraen los párametros de la request
    const { nombreUsuario, idRol } = req; 
    try {

        // se declara una constante que almacenara la generacion del token 
        // y se llama al metodo que genera el mismo para posteriormente devolver
        // una respuesta segun el resultado arrojado
        const apiKey = await generarJWT( nombreUsuario, idRol ) ;    
        return res.status(200).json({
            estadoMsg: true,
            msg: 'Key Valida',        
            nombre: nombreUsuario,
            idRol: idRol,
            apiKey: apiKey
        })  
        
    } catch (error) {
        console.log(error);
        res.status(401).json({
             Error: error,
             msg: 'No valido'
        })
    }
}

/** Metodo que permite validar que el usuario que se ingreso es un administrador */
const validaApiKeyAdmin = async ( req, res ) => { 

    try {
        const { nombreUsuario, idRol } = req;       
                if( idRol === 1 ){
                    const apiKey = await generarJWTAdmin( nombreUsuario, idRol );                
                    return res.status(200).json({
                        estadoMsg: true,
                        msg: 'Key Valida',        
                        nombre: nombreUsuario,
                        idRol: idRol,
                        apiKey: apiKey
                    }) 
                }                
                
            } catch (error) {
        return res.status(401).json({
            Error: error,
            msg: 'No valido'
        })
        
    }
    
}

/** Metodo que permite traer los roles de los usuarios */
const traeRoles = async ( req, res ) => {
    
    await pool.query('select * from roles',(error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
}

/** Metodo que permite traer los usuarios de la base de datos */
const traeUsuario = async ( req, res ) => {
    await pool.query(`SELECT  idUsuario, nombreUsuario, r.rol, correoUsuario,
    estado, activacionUsuario, desactivacionUsuario 
    FROM usuarios u join roles r on ( u.idRol = r.idRol)`,
    (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas)            
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
    traeUsuario,
    filtroUsuario,
    validaApiKeyAdmin
}











// console.log(error);
// res.status(401).json({
//     Error: error,
//     msg: 'No valido'
// })

// const { nombreUsuario, idRol } = req;    
// const apiKey = generarJWTAdmin( nombreUsuario, idRol ) ;            

// return res.json({
    //     estadoMsg: true,
    //     msg: 'Key Valida',
    //     uid: FileSystemDirectoryReaderidUsuario,
    //     nombre: nombreUsuario,
    //     correoUsuario: correoUsuario,
    //     estado: estado,
    //     activacionUsuario: activacionUsuario,
    //     desactivacionUsuario: desactivacionUsuario,                
    //     rol: rol,
            //     apiKey: apiKey
            // })  
            




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