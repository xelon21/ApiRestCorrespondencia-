const { response } = require('express');
const pool = require('../database/database');
const { logCorrespondencia } = require('../helpers/logger')




/** Metodo que muestra todas las correspondencias. */
const mostrarCorrespondencia = async ( req, res = response) => {
    await pool.query(`select d.nombreDocumento,
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
                             on( u.idUsuario = c.idUsuario );`,
                        (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
}

/** Metodo que permite mostrar el ultimo correo ingresado */
const muestraUltimo = async ( req, res ) => {
    await pool.query(`select correlativo from correo where idCorrespondencia = (SELECT MAX(idCorrespondencia) as correlativo FROM correo);`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas[0]);
        }else {
            console.log(error);
        }
    });
}

/** Metodo que trae todos los tipos de envio */
const muestraTipoEnvio = async ( req, res ) => {
    await pool.query(`select * from tipoEnvio`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
}

/** Metodo que trae todos los tipos de documento */
const muestraTipoDocumento = async ( req, res ) => {
    await pool.query(`select * from tipoDocumento`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
}

/** Metodo que busca una correspondencia por correlativo
 *  Se utiliza para modificar una correspondencia en especifico
 */
const buscarCorrelativoModificar = async ( req, res ) => {
    const { correlativo } = req.params;
    try {
        const query = ` select * from correo where correlativo = ? `
        await pool.query( query, [ correlativo ],
            (error, filas, campos ) => {
                if(!error) {
                    logCorrespondencia.info(`Se encontro una correspondencia`)
                    res.json(filas[0]);
                } else {
                    logCorrespondencia.info(`No se encontraron correspondencias asociadas al correlativo: [${correlativo}]`)
                    res.json({
                        msg: 'no hay nada'
                    })
                }
            });
    } catch (error) {
        logCorrespondencia.info(`No existe el correlativo buscado: [${correlativo}]`)
        console.log(error);
        res.json({
             Error: error,
             msg: 'Correlativo no existe'
        })
    }
}

/** Metodo que permite filtrar las correspondencias
 *  Dentro de un rango de fechas 
 */
const filtroRangoFechas = async ( req, res ) => {
    const { fechaInicio, fechaTermino  } = req.params; 
    const query = ` CALL SP_FILTROFECHAS( ?, ? ); `;
        await pool.query(query, [ fechaInicio, fechaTermino ],
        ( error, filas, campos ) => {
            if(!error) {
                res.json(filas[0]); 
            }else {
                console.log(error);
                res.json({
                    Error: error,
                    msg: 'No se encuentran correspondencias'
                })
            }
        }); 
}

/** Metodo que permite ingresar una correspondencia */
const ingresarCorrespondencia = async ( req, res ) => {    

    const { idTipoDocumento, idTipoEnvio, idUsuario, destinatario, referencia } = req.body;
    const query = `CALL SP_INGRESACORRESPONDENCIA( ?, ?, ?, ?, ? );`; 

    await pool.query(query, [ idTipoDocumento, idTipoEnvio, idUsuario,
        destinatario, referencia ],
        ( error, filas, campos ) => {     
            if(!error) {

                logCorrespondencia.info(`El usuario [${idUsuario}] agrego una correspondencia`)
                pool.query('select correlativo from correo where idCorrespondencia = (SELECT MAX(idCorrespondencia) as correlativo FROM correo);', (error, filas, campos) => {
                    res.status(200).json({                        
                        status: 'Se ha guardado la correspondencia',
                        correlativo: filas[0].correlativo
                    });                    
                })               

            } else {
                logCorrespondencia.info(`no se puede ingresar la correspondencia`)
                console.log(error);
            }
        });
}

const filtroCorrelativo = async ( req, res ) => {
    const { correlativo } = req.params;

    try {
        const query = `call SP_FILTROCORRELATIVO( ? );`
        await pool.query(query, [ correlativo ], ( error, filas, campos ) => {       
            if(!error){
                res.json(filas[0]);                
            }else {
                res.json({
                    msg: 'no hay nada'
                })
            }
        }) 
    } catch (error) {
        res.json({
            Error: error,
            msg: 'Correlativo no existe'
        })
    }
}
/** Metodo que permite modificar una correspondencia donde el 
 *  Estado del correo sea GRABADO y El usuario sea el mismo que 
 *  Creo la correspondencia.
 */
const modificarCorrespondencia = async ( req, res ) => {   

    const { idTipoEnvio, idUsuario, destinatario, referencia, estadoCorreo } = req.body;
    const { correlativo } = req.params;  
    const query2 =  `
        select * from correo where correlativo = ?
    ` ;    
    await pool.query(query2, [correlativo], (error, filas, campos) => {       
        if(!error){            
            if( filas[0].estadoCorreo === 'ANULADO' ) {
                logCorrespondencia.info(`El usuario intento anular una correspondencia ` )
            res.json({
                status: 'No se puede modificar',
                msg: 'la correspondencia ya se encuentra anulada'                
            });            
            return;            
            }else {
                if(filas[0].idUsuario === idUsuario) {

                    const query = `
                        CALL SP_MODIFICARCORRESPONDENCIA( ?, ?, ?, ?, ? );
                    `;
                    pool.query(query, [ idTipoEnvio, destinatario, referencia, correlativo, estadoCorreo ],
                        ( error, filas, campos ) => {
                            if(!error) {
                                logCorrespondencia.info(`Se actualizo la correspondencia`)
                                res.json({Status: 'Se a actualizado la correspondencia'});
                            } else {
                                logCorrespondencia.info(`ocurrio un error al modificar la correspondencia[en la query]`)
                                console.log(error);
                            }
                        });
                }else {
                    logCorrespondencia.info(`ocurrio un error al modificar la correspondencia[el usuario no es el mismo [${idUsuario}]]`)
                    res.json({
                        status: 'No se puede modificar',
                        msg: 'Error al modificar la correspondencia',
                        us: idUsuario                        
                    });  
                }
            }
        }else {
            logCorrespondencia.info(`ocurrio un error al modificar la correspondencia[error al llamar el metodo]`)
            console.log(error)
        }       
    })     
}


module.exports =  {
    mostrarCorrespondencia,
    muestraUltimo,
    muestraTipoEnvio,
    muestraTipoDocumento,
    buscarCorrelativoModificar,   
    filtroRangoFechas,
    ingresarCorrespondencia,
    modificarCorrespondencia,
    filtroCorrelativo    
    
}