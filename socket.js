let usuarioConectado = 0;

module.exports = function (io, app) {
    io.on('connection', (socket) => {
        console.log('Usuario conectado ' + socket.id);
        usuarioConectado = 1;

        io.emit('actualizar', usuarioConectado)

        socket.on('disconnect', function () {
            console.log('usuario desconectado' + socket.io);
            usuarioConectado = 0;
            io.emit ('actualizar', usuarioConectado)
        })
    })
}