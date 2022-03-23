const express = require('express');
const router= express.Router();

//trae la base de datos de mysql
const mysqlConnection = require('../database');

router.get('/api/correspondencia/mostrar', ( req, res ) => {
    mysqlConnection.query(`select d.nombreDocumento,
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
});

router.get('/api/correspondencia/mostrar/ultimo', ( req, res ) => {
    mysqlConnection.query(`SELECT MAX(correlativo) as idCorrespondencia FROM correo;`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
});


router.get('/api/correspondencia/mostrar/tipoenvio', ( req, res ) => {
    mysqlConnection.query(`select * from tipoenvio`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
});

router.get('/api/correspondencia/mostrar/tipodocumento', ( req, res ) => {
    mysqlConnection.query(`select * from tipodocumento`,
                                 (error, filas, campos) => {
        if(!error) {
            res.status(200).json(filas);
        }else {
            console.log(error);
        }
    });
});

router.get('/api/correspondencia/:correlativo', ( req, res ) => {
    const { correlativo } = req.params;

    try {

        mysqlConnection.query('SELECT * FROM correo WHERE correlativo = ?', [ correlativo ],
        ( error, filas, campos ) => {
            if(!error) {
                res.json(filas[0]);            
                console.log(filas[0])
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
   
});

router.get('/api/correspondencia/filtrar/:fechaInicio/:fechaTermino', ( req, res ) => {
    const { fechaInicio, fechaTermino  } = req.params; 
    const query = ` CALL SP_FILTROFECHAS( ?, ? ); `;
        mysqlConnection.query(query, [ fechaInicio, fechaTermino ],
        ( error, filas, campos ) => {
            if(!error) {
                res.json(filas); 
            }else {
                console.log(error);
                res.json({
                    Error: error,
                    msg: 'No se encuentran correspondencias'
                })
            }
        }); 
});

router.post('/api/correspondencia/ingresar', ( req, res ) => {
    const { idTipoDocumento, idTipoEnvio, usuario,
            destinatario, referencia } = req.body;
    const query = `        
        CALL SP_INGRESACORRESPONDENCIA( ?, ?, ?, ?, ? );
    `;
    mysqlConnection.query(query, [idTipoDocumento, idTipoEnvio, usuario,
        destinatario, referencia ],
        ( error, filas, campos ) => {
            if(!error) {
                res.json({Status: 'Se ha guardado la correspondencia'});
            } else {
                console.log(error);
            }
        });
});

router.put('/api/correspondencia/modificar/:correlativo', ( req, res ) => {
    const { idTipoEnvio, destinatario, referencia, estadoCorreo } = req.body;
    const { correlativo } = req.params;  
    const query2 =  `
        select estadoCorreo from correo where correlativo = ?
    ` ;    
    mysqlConnection.query(query2, [correlativo], (error, filas, campos) => {       
        if(!error){
            if( filas[0].estadoCorreo === 'ANULADO' ) {
            res.json({
                status: 'No se puede modificar',
                msg: 'la correspondencia ya se encuentra anulada'
                
            });            
            return;            
            }else {
                const query = `
                    CALL SP_MODIFICARCORRESPONDENCIA( ?, ?, ?, ?, ? );
                `;
                mysqlConnection.query(query, [ idTipoEnvio, destinatario, referencia, correlativo, estadoCorreo ],
                    ( error, filas, campos ) => {
                        if(!error) {
                            res.json({Status: 'Se a actualizado la correspondencia'});
                        } else {
                            console.log(error);
                        }
                    });
            }
        }else {
            console.log(error)
        }       
    })     
});

module.exports = router;