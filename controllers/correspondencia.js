//se importa la coneccion y sql de la carpeta dataqbase
import { getConnection, sql } from "../database/databaseSqlServer"
//se importa el metodo que permite generar un log de reportes dentro del direcctorio de logs
const { logCorrespondencia } = require('../helpers/logger')

//Metodo que permite obtener todas las correspondencias mediante el metodo get
export const mostrarCorrespondencia = async (req, resp) => {

    try {
        
        const pool = await getConnection()
        const result = await pool.request()
        .query(`select d.nombreDocumento,
                       e.nombreEnvio,
                       u.nombreUsuario,
                       destinatario,
                       referencia,
                       fecha,
                       correlativo,
                       estadoCorreo
                       from correo c join tipoDocumento d
                       on( d.idtipoDocumento = c.idTipoDocumento )
                       join tipoEnvio e 
                       on( e.idtipoEnvio = c.idTipoEnvio )
                       join usuarios u 
                       on( u.idUsuario = c.idUsuario )`)
     
        resp.status(200).json(result.recordset)

    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
} 

//metodo que permite ingresar una correspondencia llamando a al procedimiento almacenado SP_INGRESACORRESPONDENCIA
export const ingresarCorrespondencia = async (req, resp) => {

    //se extraen los datos del body para su posterior insercion
    const { idTipoDocumento, idTipoEnvio, idUsuario, destinatario, referencia } = req.body
     
    try {        

        const pool = await getConnection();
       
        await pool.request()
        .input('idTipoDocumento', sql.Int, idTipoDocumento)
        .input('idTipoEnvio', sql.Int, idTipoEnvio )
        .input('idUsuario', sql.Int, idUsuario)
        .input('destinatario', sql.VarChar, destinatario)
        .input('referencia', sql.VarChar, referencia)       
        .execute('SP_INGRESACORRESPONDENCIA')
        
        resp.status(200).json('Se ha agregado 1 correspondencia')    

    }catch(error){
        resp.status(400).json('ocurrio un error: ' + error +'')
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

export const muestraUltimo = async ( req, resp ) => {
    try {
        
        const pool = await getConnection()
        const result = await pool.request()
        .query(`select correlativo from correo where idCorrespondencia = (SELECT MAX(idCorrespondencia) as correlativo FROM correo);`)
     
        resp.status(200).json(result.recordset)

    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
        
}

export const muestraTipoEnvio = async ( req, resp ) => {
    try {        
        const pool = await getConnection()
        const result = await pool.request()
        .query(`select * from tipoEnvio`)
     
        resp.status(200).json(result.recordset)

    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
}

export const muestraTipoDocumento = async ( req, resp ) => {
    try {        
        const pool = await getConnection()
        const result = await pool.request()
        .query(`select * from tipoDocumento`)
     
        resp.status(200).json(result.recordset)

    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
}

export  const buscarCorrelativoModificar = async ( req, resp ) => {

        const { correlativo } = req.params;
        try {
            const pool = await getConnection()
            const result = await pool.request()
            .input('correlativo', sql.VarChar, correlativo)
            .query('select * from correo where correlativo = @correlativo')
            
            if(result.rowsAffected == 0){
                resp.status(400).json('No se encontro correspondencia asociada')
            }else {
                resp.status(200).json(result.recordset[0])
            }
         
        } catch (error) {
            logCorrespondencia.info(`No existe el correlativo buscado: [${correlativo}]`)
           resp.json({
                 Error: error,
                 msg: 'Correlativo no existe'
            })
        }
}

export const filtroRangoFechas = async ( req, resp ) => {

        const { fechaInicio, fechaTermino  } = req.params;
        try {
            const pool = await getConnection()
            const result = await pool.request()
            .input('fechaInicio', sql.VarChar, fechaInicio)
            .input('fechaTermino', sql.VarChar, fechaTermino)
            .execute('SP_FILTROFECHAS')
            
            if(result.rowsAffected == 0){
                resp.status(400).json('No se encontraron correspondencias en este rango de fechas')
            }else {
                resp.status(200).json(result.recordset)
            }
         
        } catch (error) {
            console.log(error);
            resp.json({
                 Error: error,
                 msg: 'No existen correspondencias dentro del rango de fecha ingresado'
            })
        }      
}

export const filtroCorrelativo = async ( req, resp ) => {
    const { correlativo } = req.params;
    
    try {
        const pool = await getConnection()
        const result = await pool.request()
        .input('filtro', sql.VarChar, correlativo)       
        .execute('SP_FILTROCORRELATIVO')
        
        if(result.rowsAffected == 0){
            resp.status(400).json('No se encontraron correspondencias')
        }else {
            resp.status(200).json(result.recordset)
        }
     
    } catch (error) {
        console.log(error);
        resp.json({
             Error: error,
             msg: 'No existen correspondencias con ese correlativo'
        })
    }      
}