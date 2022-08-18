//se importa la coneccion y sql de la carpeta dataqbase
import { getConnection, sql } from "../database/databaseSqlServer"
//se importa el metodo que permite generar un log de reportes dentro del direcctorio de logs
const { logCorrespondencia } = require('../helpers/logger')

//Metodo que permite obtener todas las correspondencias mediante el metodo get
export const mostrarCorrespondencia = async (req, resp) => {

    try {
    
        const pool = await getConnection()      
        const result = await pool.request()
        .query(`select d.NombreDocumento,
                       e.TipoEnvio,
                       u.NombreUsuario,
                       Destinatario,
                       Referencia,
                       Fecha,
                       Correlativo,
                       EstadoCorreo
                       from CORRESPONDENCIA2 c join TIPODOCUMENTO d
                       on( d.IdTIpoDocumento = c.IdTIpoDocumento )
                       join TIPOENVIO e 
                       on( e.IdTipoEnvio = c.IdTipoEnvio )
                       join USUARIOS u 
                       on( u.IdUsuario = c.IdUsuario )`)
        resp.status(200).json(result.recordset)
    
      
    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
} 

//metodo que permite ingresar una correspondencia llamando a al procedimiento almacenado SP_INGRESACORRESPONDENCIA
export const ingresarCorrespondencia = async (req, resp) => {

    //se extraen los datos del body para su posterior insercion
    const { IdTIpoDocumento, IdTipoEnvio, IdUsuario, Destinatario, Referencia } = req.body
    
    try {        

        const pool = await getConnection();       
         await pool.request()
        .input('IdTIpoDocumento', sql.Int, IdTIpoDocumento)
        .input('IdTipoEnvio', sql.Int, IdTipoEnvio )
        .input('IdUsuario', sql.Int, IdUsuario)
        .input('Destinatario', sql.VarChar, Destinatario)
        .input('Referencia', sql.VarChar, Referencia)       
        .execute('SP_INGRESACORRESPONDENCIA')

        const result = await pool.request()
        .query(` select Correlativo from CORRESPONDENCIA2 where IdCorrespondencia = ( select count(Correlativo) + 1 from CORRESPONDENCIA2 );`)
     
        
        resp.status(200).json({
            EstadoMsg: true,
            Correlativo: result.recordset[0].Correlativo,
            Msg: 'Se ha agregado 1 correspondencia',           
        })    

    }catch(error){
        resp.status(400).json('ocurrio un error: ' + error +'')
    } 
    
}

//Metodo que permite editar una correspondencia siempre y cuando esta no este anulada.
export const modificarCorrespondencia = async (req, resp) => {
    let validador = false;
    try {
        const { IdTipoEnvio, Destinatario, Referencia, EstadoCorreo, Correlativo2 } = req.body;    
        const pool = await getConnection()
        const result = await pool.request()
        .input('correlativo', sql.VarChar, Correlativo2)
        .query('select IdTipoEnvio, Destinatario, Referencia, EstadoCorreo from CORRESPONDENCIA2 where Correlativo = @correlativo')

        if(result.rowsAffected == 0){
            resp.json('No se encontro ninguna correspondencia asociada')
        }else{
            result.recordset.forEach(element => {
                   if(element.EstadoCorreo == 'ANULADO'){
                     validador = false;
                     resp.status(400).json('Esta correspondencia ya esta anulada')
                   }else{
                    validador = true;               
                }
                });
        }
        if(validador){
            await pool.request()
            .input('IdTipoEnvio', sql.Int, IdTipoEnvio )       
            .input('Destinatario', sql.VarChar, Destinatario )
            .input('Referencia', sql.VarChar, Referencia )
            .input('EstadoCorreo', sql.VarChar, EstadoCorreo )
            .input('Correlativo', sql.VarChar, Correlativo2 )
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
        .query(`select Correlativo from CORRESPONDENCIA2 where IdCorrespondencia = (SELECT MAX(IdCorrespondencia) as Correlativo FROM CORRESPONDENCIA2);`)
     
        resp.status(200).json(result.recordset)

    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
        
}

export const muestraTipoEnvio = async ( req, resp ) => {
    try {        
        const pool = await getConnection()
        const result = await pool.request()
        .query(`select IdTipoEnvio, TipoEnvio from TIPOENVIO`)
     
        resp.status(200).json(result.recordset)

    } catch (error) {
        
        resp.status(400).json('Error al tratar de obtener los datos: ' + error)
    }
}

export const muestraTipoDocumento = async ( req, resp ) => {
    try {        
        const pool = await getConnection()
        const result = await pool.request()
        .query(`select IdTIpoDocumento, NombreDocumento from TIPODOCUMENTO`)
     
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
            .input('Correlativo', sql.VarChar, correlativo)
            .query('select IdCorrespondencia, IdUsuario, IdTIpoDocumento, IdTipoEnvio, Destinatario, Referencia, Fecha, Correlativo, EstadoCorreo from CORRESPONDENCIA2 where Correlativo = @correlativo')
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
    const { Correlativo } = req.params;
    
    try {
        const pool = await getConnection()
        const result = await pool.request()
        .input('filtro', sql.VarChar, Correlativo)       
        .execute('SP_FILTROCORRELATIVO')
       
        if(result.rowsAffected == 0){
            resp.status(400).json('No se encontraron correspondencias')
        }else {
 
            resp.status(200).json(result.recordset[0])
        }
     
    } catch (error) {
        console.log(error);
        resp.json({
             Error: error,
             msg: 'No existen correspondencias con ese correlativo'
        })
    }      
}