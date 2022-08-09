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
                .query(`select idUsuario, idRol, correoUsuario, password, nombreUsuario, estado from usuarios where correoUsuario = @email `)
                              
                    if(result.recordset.rowsAffected == 0 ){                    
                            resp.status(404).json('No se puede ingresar');
                    }else{
                        // se corrobora que la password coincida con la que se encuentra en la base de datos                               
                        if(!result.recordset.rowsAffected == 0 || (await bcryptjs.compare(password, result.recordset[0].password))){                                                
                                  // se genera el json web token 
                                  const token = await generarJWT( result.recordset[0].nombreUsuario, result.recordset[0].idRol, result.recordset[0].idUsuario );
                                   // logLogin.info(`Usuario autenticado: ${result[0].nombreUsuario}`)
                                  // se envia mensaje de respuesta 
                                 resp.status(200).json({
                                    usuario: result.recordset[0].nombreUsuario,
                                    idRol: result.recordset[0].idRol,
                                    estado: result.recordset[0].estado,
                                    token: token
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
            .query(`select nombreUsuario, correoUsuario from usuarios`)
                                   
                    /** Se recorre el resultado de la query anterior para validar si existe el usuario */         
                    result.recordset.forEach(element => {                
                        /** Si exite el nombre de usuario y el correo, entonces devuelve verdadero */
                     if(element.nombreUsuario == nombreUsuario){
                        if( element.correoUsuario == email){  
                                cont++;
                        }else{
                            cont++;
                        }
                        }else if( element.correoUsuario == email){
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
                                .input('idRol', sql.Int, idRol)
                                .input('correoUsuario', sql.VarChar, email )
                                .input('password', sql.VarChar, hashPass)
                                .input('nombreUsuario', sql.VarChar, nombreUsuario)
                                .input('estado', sql.Int, estado)
                                .input('activacionUsuario', sql.VarChar, activacionUsuario)       
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
            const apiKey = await generarJWT( nombreUsuario, idRol, idUsuario ) ;            
            return res.status(200).json({
                estadoMsg: true,
                msg: 'Key Valida',        
                nombre: nombreUsuario,
                idRol: idRol,
                apiKey: apiKey,     
                idUsuario: idUsuario       
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
                            estadoMsg: true,
                            msg: 'Key Valida',        
                            nombre: nombreUsuario,
                            idRol: idRol,
                            apiKey: apiKey,
                            idUsuario: idUsuario
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
            .query('select * from roles')

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
            .query(`SELECT  idUsuario, nombreUsuario, r.rol, correoUsuario,
                    estado, activacionUsuario, desactivacionUsuario 
                    FROM usuarios u join roles r on ( u.idRol = r.idRol)`)
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
            .input('idUsuario', sql.VarChar, idUsuario)
            .query('select * from usuarios where idUsuario = @idUsuario')

            if(result.recordset.rowsAffected == 0){
                res.status(400).json('no se encontraron usuarios')
            }else{
                await pool.request()
                .input('idUsuario', sql.Int, idUsuario )
                .input('estado', sql.TinyInt, activo )
                .input('desactivacionUsuario', sql.VarChar, fecha )
                .execute('SP_MODIFICARESTADO')

                res.status(200).json('Se a modificado el estado del usuario')
            }
        }else{
            let activo = true;

            const result = await pool.request()
            .input('idUsuario', sql.VarChar, idUsuario)
            .query('select * from usuarios where idUsuario = @idUsuario')

            if(result.recordset.rowsAffected == 0){
                res.status(400).json('no se encontraron usuarios')
            }else{
                await pool.request()
                .input('idUsuario', sql.Int, idUsuario )
                .input('estado', sql.TinyInt, activo )
                .input('desactivacionUsuario', sql.VarChar, desactivacionUsuario )
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


//Metodo que permite editar una correspondencia siempre y cuando esta no este anulada.
export const modificarCorrespondencia = async (req, resp) => {
    let validador = false;
    try {
        const { idTipoEnvio,destinatario, referencia, estadoCorreo } = req.body;
        const { correlativo } = req.params;
        const pool = await getConnection()
        const result = await pool.request()
        .input('correlativo', sql.VarChar, correlativo)
        .query('select * from correo where correlativo = @correlativo')
        if(result.rowsAffected == 0){
            resp.json('No se encontro ninguna correspondencia asociada')
        }else{
            result.recordset.forEach(element => {
                   if(element.estadoCorreo == 'ANULADO'){
                     validador = false;
                     resp.status(400).json('Esta correspondencia ya esta anulada')
                   }else{
                    validador = true;               
                }
                });
        }
        if(validador){
            await pool.request()
            .input('idTipoEnvio', sql.Int, idTipoEnvio )       
            .input('destinatario', sql.VarChar, destinatario )
            .input('referencia', sql.VarChar, referencia )
            .input('estadoCorreo', sql.VarChar, estadoCorreo )
            .input('correlativo', sql.VarChar, correlativo )
            .execute('SP_MODIFICARCORRESPONDENCIA')

            resp.status(200).json('Se ha modificado la correspondencia') 
        }
    } catch (error) {

        resp.status(400).json('ocurrio un error: ' + error + '');
        
    }

}
