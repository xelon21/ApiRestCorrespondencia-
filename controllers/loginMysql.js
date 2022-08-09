// const { response } = require('express');
// const pool = require('../database/database');
// const bcryptjs = require('bcryptjs');
// const { generarJWT, generarJWTAdmin } = require('../helpers/jwt');
// const { logLogin } = require('../helpers/logger')


// const usuarioLogout = (req, res = response ) => {
//     try {
//         const { logeado } = req.body

//         if(!logeado){
//             return res.status(403).json('El usuario no puede desconectarse')
//         }else{
//             estadolog = false;
//         }
        
//     } catch (error) {
//         logLogin.error(`Error al desconectarse ${usuario}`)
//         console.log(error)
        
//     }
// }

// /** Metodo que permite el logueo de un usuario */
// const loginUsuario = (req, res = response) => {

//     try {
//         // se extraen los parametros del body        
//         const {email, password} = req.body  
        
        
//         // se valida que el email y el password no vengan vacios
//         if(!email || !password){
//            return res.json('Debe ingresar un usuario y contraseña')
            
//         }else {    
//                 pool.query('select idUsuario, idRol, correoUsuario, password, nombreUsuario, estado from usuarios where correoUsuario = ? ', [email], async (error, result) => {                
//                     if(!result[0] ){                    
//                         return res.status(404).json('No se puede ingresar');
//                     }else{
                        
//                             //const usuario = result[0].nombreUsuario; 
//                             // se corrobora que la password coincida con la que se encuentra en la base de datos                               
//                             if(!result.length === 0 || (await bcryptjs.compare(password, result[0].password))){                                                
//                               // se genera el json web token 
//                               const token = await generarJWT( result[0].nombreUsuario, result[0].idRol, result[0].idUsuario );
//                               logLogin.info(`Usuario autenticado: ${result[0].nombreUsuario}`)
//                               // se envia mensaje de respuesta 
//                               res.json({
//                                   estadoMsg: true,
//                                   msg: 'Se ha conectado con exito',
//                                   apiKey: token,
//                                   idUsuario: result[0].idUsuario,
//                                   email: result[0].correoUsuario,
//                                   idRol: result[0].idRol,                        
//                                   nombre: result[0].nombreUsuario,                        
//                                   estado: result[0].estado,                            
//                               });                            
                              
//                             }else{
//                             logLogin.warn(`credenciales no coinciden: ${result[0].nombreUsuario}`)                 
//                             res.status(404).json('Las credenciales no coinciden');
                            
//                         }
//                     }
//                 })
          
//             // se ejecuta query en mysql de todos los datos del usuario segun su nombre de usuario una vez paso la validacion anterior
            
//         }       
//     } catch (error) {
//         logLogin.error(`Error al ingresar: ${error}`)
//         console.log(error)
//     }
// }

// /** Metodo que permite filtrar usuarios mediante su nombre de usuario
//  *  [ esta opcion solo puede ocuparla el administrador en su respectiva ventana ]
//  */
// const filtroUsuario = async ( req, res ) => {
//     // se extraen los parametros de la request
//     const { nombreUsuario } = req.params;    

//     try {
//         // se genera una constante query con el procedimiento de 
//         //almacenado que filtra por nombre de usuario
//         const query = ` CALL SP_FILTRAUSUARIONOMBRE( ? );`
        
//         // se ejecuta la query para posteriormente enviar una 
//         // respuesta si encuentra o no encuentra al usuario filtrado
//         await pool.query(query, [ nombreUsuario ],
//         ( error, filas, campos ) => {
//             if(!error) {                
//                 res.json(filas[0]);
//             } else {
//                 res.json({
//                     msg: 'no hay nada'
//                 })
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         res.json({
//              Error: error,
//              msg: 'Usuario no existe'
//         })
//     }
   
// }

// /** Metodo que permite registrar un usuario
//  * [ Esta opcion solo se encuentra en el panel de administracion ]
//  */
// const registroUsuario = async (req, res) => {

//     // se extraen  los datos del body
//     const { idRol, email, password, nombreUsuario, estado, fech1 } = req.body   
//     const query = `        
//         CALL SP_REGISTROUSUARIO( ?, ?, ?, ?, ?, ? );
//     `;      
       
//     try {
//         // se genera el hash de la contraseña para postariormente almacenarla en la base de datos
//         let hashPass = await bcryptjs.hash(password, 8)
//         let cont = 0;
//         pool.query('select nombreUsuario, correoUsuario from usuarios', (error, filas, campos) =>{                                                  
//                 /** Se recorre el resultado de la query anterior para validar si existe el usuario */         
//                 filas.forEach(element => {                
//                     /** Si exite el nombre de usuario y el correo, entonces devuelve verdadero */
//                   if(element.nombreUsuario === nombreUsuario || element.correoUsuario === email){  
//                             cont++;
//                   }
//                 })                 
//                 /** Se valida la confirmacion del FOREACH anterior, si el usuario existe, no se crea el usuario
//                  * pero si no esxiste, se crea el Usuario*/  
                         
//                 if(cont >= 1){                                 
//                     res.json({
//                         estadoMsg: false,
//                         msg: 'Error al ingresar el usuario'
//                     })                                             
//                 }else{
//                 /** Una vez que no exista el usuario dentro de la base de datos, se envian los datos de creacion */
//                 pool.query( query ,[ idRol, email, hashPass, nombreUsuario, estado, fech1 ],
//                     (error, filas, campos) => {                   
//                         logLogin.info(`Se ingreso un usuario`)
//                         res.json({
//                             estadoMsg: true,
//                             msg:'Usuario ingresado'})                              
//                     }
//                 )}  
//             })
//         }catch (error) {
//             logLogin.error(`Error al ingresar un usuario ${error}`)
//                 console.log(error)
//                 res.status(401).json({
//                     Error: error,
//                     msg: 'Ha ocurrido un error'
//                 })
//         }        
// }

// /** Metodo que permite validar el token de un usuario al ingresarse y volver a autenticarlo */
// const validaApiKey = async ( req, res ) => {    

//     // se extraen los párametros de la request
//     const { nombreUsuario, idRol, idUsuario} = req; 
//     try {      
//         // se declara una constante que almacenara la generacion del token 
//         // y se llama al metodo que genera el mismo para posteriormente devolver
//         // una respuesta segun el resultado arrojado
//         const apiKey = await generarJWT( nombreUsuario, idRol, idUsuario ) ;            
//         return res.status(200).json({
//             estadoMsg: true,
//             msg: 'Key Valida',        
//             nombre: nombreUsuario,
//             idRol: idRol,
//             apiKey: apiKey,     
//             idUsuario: idUsuario       
//         })  
        
        
//     } catch (error) {
//         console.log(error);
//         res.status(401).json({
//              Error: error,
//              msg: 'No valido'
//         })
//     }
// }

// /** Metodo que permite validar que el usuario que se ingreso es un administrador */
// const validaApiKeyAdmin = async ( req, res ) => { 

//     try {
//         const { nombreUsuario, idRol, idUsuario } = req;           
//                 if( idRol === 1 ){
//                     const apiKey = await generarJWTAdmin( nombreUsuario, idRol, idUsuario );                
//                     return res.status(200).json({
//                         estadoMsg: true,
//                         msg: 'Key Valida',        
//                         nombre: nombreUsuario,
//                         idRol: idRol,
//                         apiKey: apiKey,
//                         idUsuario: idUsuario
//                     }) 
//                 }                
                
//             } catch (error) {
//         return res.status(401).json({
//             Error: error,
//             msg: 'No valido'
//         })
        
//     }
    
// }

// /** Metodo que permite filtrar un usuario mediante su id */
// const filtroIdUsuario = async ( req, res ) => {
//     /** Se obtiene el id del usuario mediante los parametros */
//     const { idUsuario } = req.params;

//     try {
//         /** Se ejecuta el prosedimiento almacenado enviandole el id del ususario */
//         const query = ` call SP_FILTROUSUARIO( ? );`
//         await pool.query(query, [ idUsuario ],
//         ( error, filas, campos ) => {
//             if(!error) {                
//                 const arreglo = filas[0]     
//                 res.json(arreglo[0]);
//             } else {
//                 res.json({
//                     msg: 'No hay nada'
//                 })
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         res.json({
//              Error: error,
//              msg: 'Usuario no existe'
//         })
//     }
   
// }

// /** Metodo que permite traer los roles de los usuarios */
// const traeRoles = async ( req, res ) => {
//     /** Se ejecuta la query que trae todos los roles de la base de datos */
//     await pool.query('select * from roles',(error, filas, campos) => {
//         if(!error) {
//             res.status(200).json(filas);
//         }else {
//             console.log(error);
//         }
//     });
// }

// /** Metodo que permite traer los usuarios de la base de datos */
// const traeUsuario = async ( req, res ) => {
//     /** Se ejecuta la query que permite traer todos los usuarios con sus roles respectivos */
//     await pool.query(`SELECT  idUsuario, nombreUsuario, r.rol, correoUsuario,
//     estado, activacionUsuario, desactivacionUsuario 
//     FROM usuarios u join roles r on ( u.idRol = r.idRol)`,
//     (error, filas, campos) => {
//         if(!error) {
//             res.status(200).json(filas)            
//         }else {
//             console.log(error);
//         }
//     })
// } 

// /** Metodo que permite desactivar un usuario cambiando directamente el estado
//  *  O desactivar el usuario dependiendo de una fecha de desactivacion
//  */
// const desactivarUsuario = async ( req, res ) => {
//     /** Se obtienen los datos del body, el estado y la fecha de desactivacion */
//     const { estado, desactivacionUsuario } = req.body;
//     /** Se obtiene el id del ususario a desactivar */
//     const { idUsuario } = req.params;
//     /** Query que trae la informacion del ususario dependiendo del id */
//     const query2 = `
//             select * from usuarios where idUsuario = ?
//     `;              
//     try {
//         /** Si la opcion del estado esta activada, entonces se hara la desactivacion
//          * del ususario directamente y deja de estar activo.
//          */
//         if( estado ){
//             const fecha = new Date();   
//             let activo = false;         
//             await pool.query(query2, [idUsuario], (error, filas, campos) => {
//                 if(!error) {
//                     /** Se llama al procedimiento almacenado para modificar el estado y se le
//                      * entregan los parametros que necesita.
//                      */
//                     const query = `
//                         Call SP_MODIFICARESTADO ( ?, ?, ?);
//                     `;
//                     pool.query(query, [ idUsuario, activo, fecha ],
//                         (error, filas, campos) => {
//                             if(!error){
//                                 logLogin.info(`Se modifico el estado del usuario ${idUsuario}`)
//                                 res.json({Status: 'Se a actualizado el estado'});
//                             }else{
//                                 res.json({
//                                     msg: 'error al ingresar los datos'
//                                 })
//                             }
//                         })
//                 }else {
                    
//                 res.json({
//                     status: 'No se puede modificar',
//                     msg: 'No se pueden modificar los datos',                                      
//                 });  
//                 }
//             })
//         } else {
//             /** Si el estado del usuario no esta seleccionado, entonces se desactivara
//              * al usuario mediante una fecha. Una vez llegue esa fecha, el usuario dejara de
//              * estar activo, pero hasta ese momento, el ususario seguira activo.
//              */
//             let activo = true;       
//             await pool.query(query2, [idUsuario], (error, filas, campos) => {
//                 if(!error) {
//                     /** Se llama al procedimiento almacenado para modificar el estado y se le
//                      * entregan los parametros que necesita.
//                      */
//                     const query = `
//                         Call SP_MODIFICARESTADO ( ?, ?, ?);
//                     `;
//                     pool.query(query, [ idUsuario, activo, desactivacionUsuario ],
//                         (error, filas, campos) => {
//                             if(!error){
//                                 logLogin.info(`Se actualizo el estado del usuario: ${idUsuario}`)
//                                 res.json({Status: 'Se a actualizado la fecha de desactivacion'});
//                             }else{                                    
//                                 res.json({
//                                     msg: 'No se a podido ingresar los datos'
//                                 })
//                             }
//                         })
//                 }else {
//                     logLogin.error(`No Se pudo modificar el estado`)   
//                 res.json({
//                     status: 'No se puede modificar',
//                     msg: 'No se pueden modificar los datos',                                      
//                 });  
//                 }
//             })

//         }
        
//     } catch (error) {
//         logLogin.error(`No Se pudo modificar el estado`)
//         console.log(error)
//         res.json({
//             status: 'No se puede modificar',
//             msg: 'No se pueden modificar los datos',                                      
//         });  
        
//     }
// }

// /** Metodo que permite modificar la contraseña de un usuario
//  *  [Cabe decir que este metodo es solo para el administrador
//  *   con fecha del 02/05/2022]
//  */
// const modificarPassword = async ( req, res ) => {   

//     /** Se obtienen las contraseñas del body */
//     const { password, password2 } = req.body 
//     /** Se obtiene el id del usuario */
//     const { idUsuario } = req.params;  
//     /** Se ejecuta la query para traer todos los datos 
//      *  Del id del usuario ingresado
//      */
//     const query2 =  `
//         select * from usuarios where idUsuario = ?
//     ` ;  
//     try { 
//         /** Se verifican 2 contraseñas si alguna no coincide, se envia mensaje de error */      
//         if(password != password2){
//             res.json({                
//                 msg: 'Las contraseñas no coinciden',                                      
//             });
//         }else {
//             /** Si pasa la validacion anterior, quiere decir que la primera password es la misma que la de confirmacion,
//              * por lo que se le hace un hash a la password 1 para posteriormente ingresarla en la base de datos.
//              */
//             let hashPass = await bcryptjs.hash(password, 8)          
//             await pool.query(query2, [idUsuario], (error, filas, campos) => {
//                 if(!error) { 
//                     /** Procedimiento almacenado que modifica la password,
//                      * Se envian los datos que necesita para funcionar
//                      * Password
//                      * IdUsuario
//                      */
//                         const query = `
//                                 CALL SP_MODIFICARPASSWORD( ?, ? );
//                             `;                   
//                             pool.query(query, [ idUsuario, hashPass ],
//                                 ( error, filas, campos ) => {
//                                     if(!error) {
//                                         logLogin.info(`Se modifico la contraseña del usuario ${idUsuario}`)
//                                         res.json({Status: 'Se a actualizado la contraseña'});
//                                     } else {
//                                         console.log(error);
//                                         res.json({
//                                             msg: 'error al ingresar los datos'
//                                         })
//                                     } 
//                                 })
//                             } else{
//                                 logLogin.error(`No Se pudo modificar la contraseña`)
//                                 res.json({
//                                     status: 'No se puede modificar',
//                                     msg: 'No se puede modificar la contraseña',                                      
//                                 });  
//                             }
//                         })  
//         }
//     } catch (error) {
//         logLogin.error(`No Se pudo modificar la contraseña`)
//         console.log(error)
//         res.json({
//             status: 'No se puede modificar',
//             msg: 'No se puede modificar la contraseña',                                      
//         });  
//     }  
// }

// /** Metodo que permite modificar un usuario mediante su id de usuario */
// const modificarUsuario = async ( req, res ) => {   
//     /** Se obtiene el idRol, CorreoUsuario y nombreusuario del body */
//     const { idRol, correoUsuario, nombreUsuario } = req.body 
//     /** Se obtiene el id del usuario desde los params */
//     const { idUsuario } = req.params;  
//     /** Se ejecuta la query que permite traer todos los datos 
//      * del usuario asociado al id entregado
//      */
//     const query2 =  `
//         select * from usuarios where idUsuario = ?
//     ` ;    
//     await pool.query(query2, [idUsuario], (error, filas, campos) => {
//         if(!error) {    
//             /** Se verifica si el id del usuario entregado es verdadero */
//             if( filas[0].idUsuario ){ 
//                /**  Si logra pasar la validacion anterior se ejecuta el Procedimiento almacenado
//                 * y se le entregan los siguientes parametros
//                 * idUsuario
//                 * idRol
//                 * correoUsuario
//                 * NombreUsuario
//                 */
//                 const query = `
//                         CALL SP_MODIFICARUSUARIO( ?, ?, ?, ? );
//                     `;                   
//                     pool.query(query, [ idUsuario, idRol, correoUsuario, nombreUsuario ],
//                         ( error, filas, campos ) => {
//                             if(!error) {
//                                 res.json({Status: 'Se a actualizado el usuario'});
//                                 logLogin.info(`Se modifico el usuario: ${nombreUsuario}`)
//                             } else {
//                                 console.log(error);
//                                 res.json({
//                                     msg: 'error al ingresar los datos'
//                                 })
//                             } 
//                         });
//             }else {                
//                 logLogin.error(`No se puede modificar al usuario`)
//                 res.json({
//                     status: 'No se puede modificar',
//                     msg: 'No se puede modificar el usuario',                                      
//                 });  
//             }
//         }else {
//             logLogin.error(`No se puede modificar al ususario`)
//             console.log(error)
//         }       
//     })     
// }

// /** Se exportan los metodos para poder ser utilizados  */
// module.exports = {
//     loginUsuario,
//     registroUsuario,
//     validaApiKey,
//     traeRoles,
//     traeUsuario,
//     filtroUsuario,
//     validaApiKeyAdmin,
//     modificarUsuario,
//     filtroIdUsuario,
//     modificarPassword,
//     desactivarUsuario,
//     usuarioLogout
// }


