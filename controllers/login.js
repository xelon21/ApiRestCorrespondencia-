//se importa la coneccion y sql de la carpeta dataqbase
import { getConnection, sql } from "../database/databaseSqlServer"
//se importa el metodo que permite generar un log de reportes dentro del direcctorio de logs
const bcryptjs = require('bcryptjs');
const { generarJWT, generarJWTAdmin } = require('../helpers/jwt');
const { logLogin } = require('../helpers/logger')

//Metodo que permite obtener todas las correspondencias mediante el metodo get
export const loginUsuario = async (req, resp) => {

        try {
            // se extraen los parametros del body        
            let { email, password } = req.body     
            // se valida que el email y el password no vengan vacios
            if(!email || !password){
               resp.status(404).json('Debe ingresar un usuario y contraseña')
                
            }else {

                const pool = await getConnection()
                const result = await pool.request()
                .input('email', sql.VarChar, email)
                .query(`select IdUsuario, IdRol, CorreoUsuario, Password, NombreUsuario, Estado from USUARIOS where CorreoUsuario = @email `)                              
               
                    if(result.recordset.rowsAffected == 0 ){                    
                            resp.status(404).json('No se puede ingresar');
                    }else{
                        // se corrobora que la password coincida con la que se encuentra en la base de datos                               
                        if(!result.recordset.rowsAffected == 0 || (await bcryptjs.compare(password, result.recordset[0].Password))){                                                
                                  // se genera el json web token 
                                const token = await generarJWT( result.recordset[0].NombreUsuario, result.recordset[0].IdRol, result.recordset[0].IdUsuario );
                                   // logLogin.info(`Usuario autenticado: ${result[0].nombreUsuario}`)
                                  // se envia mensaje de respuesta 
                                resp.status(200).json({
                                    Usuario: result.recordset[0].NombreUsuario,
                                    IdRol: result.recordset[0].IdRol,
                                    Estado: result.recordset[0].Estado,
                                    ApiKey: token
                                })
                        }else{
                            resp.status(400).json('Las credenciales no coinciden')
                        }
                    }
                } 
        } catch (error) {

            resp.status(400).json('ocurrio un error: ' + error);
            
        }
}


export const registroUsuario = async (req, res) => {

        // se extraen  los datos del body
        const { idRol, email, password, nombreUsuario, estado, activacionUsuario } = req.body 
           
        try {
            // se genera el hash de la contraseña para postariormente almacenarla en la base de datos
            let hashPass = await bcryptjs.hash(password, 8)
            let cont = 0;

            const pool = await getConnection();
            const result = await pool.request()
            .query(`select NombreUsuario, CorreoUsuario from USUARIOS`)
                                   
                    /** Se recorre el resultado de la query anterior para validar si existe el usuario */         
                    result.recordset.forEach(element => {                
                        /** Si exite el nombre de usuario y el correo, entonces devuelve verdadero */
                     if(element.NombreUsuario == nombreUsuario){
                        if( element.CorreoUsuario == email){  
                                cont++;
                        }else{
                            cont++;
                        }
                        }else if( element.CorreoUsuario == email){
                            cont ++
                        }
                    })                 
                    /** Se valida la confirmacion del FOREACH anterior, si el usuario existe, no se crea el usuario
                     * pero si no esxiste, se crea el Usuario*/ 
                    if(cont >= 1){                                 
                        res.status(400).json({
                            estadoMsg: false,
                            msg: 'Error al ingresar el usuario'
                        })                                             
                    }else{
                    /** Una vez que no exista el usuario dentro de la base de datos, se envian los datos de creacion */
                            await pool.request()
                                .input('IdRol', sql.Int, idRol)
                                .input('CorreoUsuario', sql.VarChar, email )
                                .input('Password', sql.VarChar, hashPass)
                                .input('NombreUsuario', sql.VarChar, nombreUsuario)
                                .input('Estado', sql.Int, estado)
                                .input('ActivacionUsuario', sql.VarChar, activacionUsuario)       
                                .execute('SP_REGISTROUSUARIO')
                            
                            res.status(200).json('Usuario Agregado')
                    }  
             }catch (error) {               
                  
                    res.status(401).json({
                        Error: error,
                        msg: 'Ha ocurrido un error'
                    })
            }        
    
}

export const validaApiKey = async ( req, res ) => {    

        // se extraen los párametros de la request
        const { nombreUsuario, idRol, idUsuario} = req;       
        try {      
            // se declara una constante que almacenara la generacion del token 
            // y se llama al metodo que genera el mismo para posteriormente devolver
            // una respuesta segun el resultado arrojado
            const token = await generarJWT( nombreUsuario, idRol, idUsuario ) ;            
            return res.status(200).json({
                EstadoMsg: true,
                Msg: 'Key Valida',        
                Nombre: nombreUsuario,
                IdRol: idRol,
                ApiKey: token,     
                IdUsuario: idUsuario       
            })  
        } catch (error) {
            console.log(error);
            res.status(401).json({
                Error: error,
                msg: 'No valido'
            })
        }
}

export  const validaApiKeyAdmin = async ( req, res ) => { 

        try {
            const { nombreUsuario, idRol, idUsuario } = req;           
                    if( idRol === 1 ){
                        const apiKey = await generarJWTAdmin( nombreUsuario, idRol, idUsuario );                
                        return res.status(200).json({
                            EstadoMsg: true,
                            Msg: 'Key Valida',        
                            Nombre: nombreUsuario,
                            IdRol: idRol,
                            ApiKey: apiKey,
                            IdUsuario: idUsuario
                        }) 
                    }                
                    
                } catch (error) {
            return res.status(401).json({
                Error: error,
                msg: 'No valido'
            })
            
        }        
}


export const filtroIdUsuario = async ( req, res ) => {
        /** Se obtiene el id del usuario mediante los parametros */
        const { idUsuario } = req.params;
            
        try {
            /** Se ejecuta el prosedimiento almacenado enviandole el id del ususario */
            const pool = await getConnection()
            const result = await pool.request()
            .input('filtro', sql.VarChar, idUsuario)
            .execute('SP_FILTROUSUARIO')

            if(result.recordset.rowsAffected == 0){
                res.status(400).json("No se encontraron usuarios")
            }else {
                res.status(200).json(result.recordset[0])
            }
            
       
        } catch (error) {
            console.log(error);
            res.json({
                 Error: error,
                 msg: 'Usuario no existe'
            })
        }
}

export const traeRoles = async ( req, res ) => {
        /** Se ejecuta la query que trae todos los roles de la base de datos */
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query('select * from ROLES')

            res.status(200).json(result.recordset)
            
        } catch (error) {
            
            res.status(400).json({
                msg: 'No se encontraron roles',
                error: error
            })
        }
       
}

export const traeUsuario = async ( req, res ) => {
        /** Se ejecuta la query que permite traer todos los usuarios con sus roles respectivos */
        try {

            const pool = await getConnection()
            const result = await pool.request()
            .query(`SELECT  IdUsuario, NombreUsuario, r.Rol, CorreoUsuario,
                    Estado, ActivacionUsuario, DesactivacionUsuario 
                    FROM USUARIOS u join ROLES r on ( u.IdRol = r.IdRol)`)
            res.status(200).json(result.recordset)
            
        } catch (error) {

            res.status(400).json({
                msg: 'No se encontraron usuarios',
                error: error
            })
            
        }      
}

export const desactivarUsuario = async ( req, res ) => {

    try {
        /** Se obtienen los datos del body, el estado y la fecha de desactivacion */
        const { estado, desactivacionUsuario } = req.body;
        /** Se obtiene el id del ususario a desactivar */
        const { idUsuario } = req.params;
        /** Query que trae la informacion del ususario dependiendo del id */      
        const pool = await getConnection()
       
        if(estado == 1 ){
            const fecha = new Date();
            let activo = false;
            const result = await pool.request()
            .input('IdUsuario', sql.VarChar, idUsuario)
            .query('select * from USUARIOS where IdUsuario = @idUsuario')

            if(result.recordset.rowsAffected == 0){               
                res.status(400).json('no se encontraron usuarios')
            }else{          
                await pool.request()
                .input('IdUsuario', sql.Int, idUsuario )
                .input('Estado', sql.TinyInt, activo )
                .input('DesactivacionUsuario', sql.Date, fecha )
                .execute('SP_MODIFICARESTADO')
  
                res.status(200).json('Se a modificado el estado del usuario')
            }
        }else{
            let activo = true;
            const result = await pool.request()
            .input('IdUsuario', sql.VarChar, idUsuario)
            .query('select * from USUARIOS where IdUsuario = @idUsuario')

            if(result.recordset.rowsAffected == 0){
                res.status(400).json('no se encontraron usuarios')
            }else{
                await pool.request()
                .input('IdUsuario', sql.Int, idUsuario )
                .input('Estado', sql.TinyInt, activo )
                .input('DesactivacionUsuario', sql.VarChar, desactivacionUsuario )
                .execute('SP_MODIFICARESTADO')

                res.status(200).json('Se a modificado el estado del usuario')
            }
        }
       
    } catch (error) {

        res.status(400).json({
            msg: 'no pueden modificar los datos',
            error: error
        })
        
    }
}

export const modificarPassword = async ( req, res ) => {   

       /** Se obtienen las contraseñas del body */
       const { password, password2 } = req.body 
       /** Se obtiene el id del usuario */
       const { idUsuario } = req.params;  
       /** Se ejecuta la query para traer todos los datos 
        *  Del id del usuario ingresado*/      
       const pool = await getConnection()
       try { 
            const result = await pool.request()
            .input('IdUsuario', sql.VarChar, idUsuario)
            .query('select * from USUARIOS where IdUsuario = @idUsuario')
           /** Se verifican 2 contraseñas si alguna no coincide, se envia mensaje de error */      
           if(password != password2){
               res.json({                
                   msg: 'Las contraseñas no coinciden',                                      
               });
           }else {
               /** Si pasa la validacion anterior, quiere decir que la primera password es la misma que la de confirmacion,
                * por lo que se le hace un hash a la password 1 para posteriormente ingresarla en la base de datos.
                */
               let hashPass = await bcryptjs.hash(password, 8)
               if(result.recordset.rowsAffected == 0){
                    res.status(400).json('no se encontraron usuarios')
               }else {
                    await pool.request()
                        .input('IdUsuario', sql.Int, idUsuario)
                        .input('Password', sql.VarChar, hashPass)
                        .execute('SP_MODIFICARPASSWORD')
                        
                        res.status(200).json(' Se ha modificado la contraseña ')
               }         
            }
       } catch (error) {
           //logLogin.error(`No Se pudo modificar la contraseña`)
           console.log(error)
           res.json({             
               msg: 'No se puede modificar la contraseña', 
               error: error                                     
           });  
       }  
}


//Metodo que permite editar una correspondencia siempre y cuando esta no este anulada.
export const modificarUsuario = async ( req, res ) => {   
    /** Se obtiene el idRol, CorreoUsuario y nombreusuario del body */
    const { idRol, correoUsuario, nombreUsuario } = req.body 
    /** Se obtiene el id del usuario desde los params */
    const { idUsuario } = req.params;  
    /** Se ejecuta la query que permite traer todos los datos 
     * del usuario asociado al id entregado*/
    const pool = await getConnection()

    try {
        const result = await pool.request()
            .input('IdUsuario', sql.VarChar, idUsuario)
            .query('select * from USUARIOS where IdUsuario = @idUsuario')
        
        if(result.recordset.rowsAffected == 0){
            res.status(400).json('No se encontraron registros')
        }else{

            await pool.request()
            .input('IdUsuario', sql.Int, idUsuario)
            .input('IdRol', sql.Int, idRol)
            .input('CorreoUsuario', sql.VarChar, correoUsuario)
            .input('NombreUsuario', sql.VarChar, nombreUsuario)
            .execute('SP_MODIFICARUSUARIO')

            res.status(200).json('Se ha modificado el usuario')
        }
        
    } catch (error) {
        
        //logLogin.error(`No Se pudo modificar la contraseña`)
        console.log(error)
        res.json({
            msg: 'No se puede modificar el usuario',  
            error: error                                    
        });  
    }

}
