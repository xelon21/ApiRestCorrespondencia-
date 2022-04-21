const { response } = require('express');
const pool = require('../database/database');
var os = require('os');




/** Metodo que muestra todas las correspondencias. */
const mostrarCorrespondencia = async ( req, res = response) => {
    await pool.query(`select d.nombreDocumento,
                                  e.nombreEnvio,
                                  usuario,
                                  destinatario,
                                  referencia,
                                  fecha,
                                  correlativo,
                                  estadoCorreo
                                  from correo c join tipodocumento d
                                  on ( c.idTipoDocumento = d.idTipoDocumento)
                                  join tipoenvio e
                                  on ( c.idTipoEnvio = e.idTipoEnvio )`,
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
    await pool.query(`SELECT MAX(correlativo) as idCorrespondencia FROM correo;`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
}

/** Metodo que trae todos los tipos de envio */
const muestraTipoEnvio = async ( req, res ) => {
    await pool.query(`select * from tipoenvio`,
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
    await pool.query(`select * from tipodocumento`,
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
             msg: 'Correlativo no existe'
        })
    }
}

/** Metodo que permite filtrar una correspondencia por correlativo
 *  Se utiliza en el filtro por correlativo y rango de fechas
 */
const filtroCorrelativo = async ( req, res ) => {
    const { correlativo } = req.params;

    try {
        const query = ` call SP_FILTROCORRELATIVO( ? );`
        await pool.query(query, [ correlativo ],
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

    const { idTipoDocumento, idTipoEnvio, usuario, destinatario, referencia } = req.body;
    const query = `        
        CALL SP_INGRESACORRESPONDENCIA( ?, ?, ?, ?, ? );
    `;
    await pool.query(query, [idTipoDocumento, idTipoEnvio, usuario,
        destinatario, referencia ],
        ( error, filas, campos ) => {
            if(!error) {
                res.json({Status: 'Se ha guardado la correspondencia'});
            } else {
                console.log(error);
            }
        });
}

/** Metodo que permite modificar una correspondencia donde el 
 *  Estado del correo sea GRABADO y El usuario sea el mismo que 
 *  Creo la correspondencia.
 */
const modificarCorrespondencia = async ( req, res ) => {   

    const { idTipoEnvio, usuario, destinatario, referencia, estadoCorreo } = req.body;
    const { correlativo } = req.params;  
    const query2 =  `
        select * from correo where correlativo = ?
    ` ;    
    await pool.query(query2, [correlativo], (error, filas, campos) => {       
        if(!error){            
            if( filas[0].estadoCorreo === 'ANULADO' ) {
            res.json({
                status: 'No se puede modificar',
                msg: 'la correspondencia ya se encuentra anulada'                
            });            
            return;            
            }else {                
                if(filas[0].usuario === usuario) {

                    const query = `
                        CALL SP_MODIFICARCORRESPONDENCIA( ?, ?, ?, ?, ? );
                    `;
                    pool.query(query, [ idTipoEnvio, destinatario, referencia, correlativo, estadoCorreo ],
                        ( error, filas, campos ) => {
                            if(!error) {
                                res.json({Status: 'Se a actualizado la correspondencia'});
                            } else {
                                console.log(error);
                            }
                        });
                }else {
                    res.json({
                        status: 'No se puede modificar',
                        msg: 'Error al modificar la correspondencia',
                        us: usuario                        
                    });  
                }
            }
        }else {
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
    filtroCorrelativo,
    filtroRangoFechas,
    ingresarCorrespondencia,
    modificarCorrespondencia
    
}