const net = require('net')

const options = {
    port: 4100,
    host: '10.0.0.111'
}

const client  = net.createConnection(options)

client.on('connect', () => {
    console.log('coneccion exitosa')
    client.write('hola mundo')
})

client.on('error', (error) => {
    console.log(error.message)
})

