const { format, transports } = require('winston');
const winston = require('winston');
require('winston-daily-rotate-file');



const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: `${__dirname}/../logs/logCorrespondencia %DATE%.log`,
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '5m',
    maxFiles: '30d',
    format: format.combine(
        format.simple(),
        format.timestamp({
    format: 'DD-MM-YYYY  HH:mm:ss A', // 25-01-2022 // 13:23:10 PM
    }),
    format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`)
    )});

const fileRotateTransportAdmin = new winston.transports.DailyRotateFile({
        filename: `${__dirname}/../logs/logAdministracion %DATE%.log`,
        datePattern: 'DD-MM-YYYY',
        zippedArchive: true,
        maxSize: '5m',
        maxFiles: '30d',
        format: format.combine(
            format.simple(),
            format.timestamp({
        format: 'DD-MM-YYYY  HH:mm:ss A', // 25-01-2022 // 13:23:10 PM
        }),
        format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`)
        )});
    
fileRotateTransport.on('rotate', (oldFilename, newFilename) => {
        
});
    
const logCorrespondencia = winston.createLogger({                
        transports: [
            fileRotateTransport
        ]
});



const logLogin = winston.createLogger({
    transports: [
        fileRotateTransportAdmin
    ]
}) 



module.exports = {
    logLogin,
    logCorrespondencia
}