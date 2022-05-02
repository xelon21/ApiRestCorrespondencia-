const { format, transports } = require('winston');
const winston = require('winston');

/** Se exporta el metodo que crea los logs. Donde podemos configurar que queremos 
 * que nos muestre dicho log que se creara en una carpeta definida.
 */


const logCorrespondencia = winston.createLogger({
    transports: [
        
        new transports.File({
            format: format.combine(
                format.simple(),
                format.timestamp({
                    format: 'DD-MM-YYYY  HH:mm:ss A', // 25-01-2022 // 13:23:10 PM
                  }),
                format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`)
            ),
            maxsize: 5120000,
            maxFiles: 7,
            filename: `${__dirname}/../logs/logCorrespondencia.log`
        }),
        new transports.Console({
            level: 'debug',
            
        })
    ]
  });



const logLogin = winston.createLogger({
    transports: [
        
        new transports.File({
            format: format.combine(
                format.simple(),
                format.timestamp({
                    format: 'DD-MM-YYYY  HH:mm:ss A', // 25-01-2022 // 13:23:10 PM
                  }),
                format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`)
            ),
            maxsize: 5120000,
            maxFiles: 7,
            filename: `${__dirname}/../logs/logAdministracion.log`
        }),
        new transports.Console({
            level: 'debug',
            
        })
    ]
})

module.exports = {
    logLogin,
    logCorrespondencia
}