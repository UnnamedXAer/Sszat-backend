const logger = require('../../../logger/pino');

function setClientActiveTime(io, socket, next) {
	io.clientsMap[socket.handshake.session.user.id] = {
		socketId: socket.id,
		activeOn: new Date().toUTCString()
	};
	logger.info(`-- SOCKET-IO--middleware; (${socket.handshake.session.user.id})`, io.clientsMap[socket.handshake.session.user.id]);
	next();
}

function updateClientActiveTime(io, socket, next) {
	const client = io.clientsMap[socket.handshake.session.user.id];
	logger.info(`1 --SOCKET-- updateTime; (${socket.handshake.session.user.id})`, client);

	if (client) {
		client.activeOn = new Date().toUTCString();
	}
	else {
		console.log("---- SOCKET ---- NO --- CLIENT -- (", socket.handshake.session.user.id, ")");
		io.clientsMap[socket.handshake.session.user.id] = {
			socketId: socket.id,
			activeOn: new Date().toUTCString()
		};
	}

	logger.info(`2 --SOCKET-- updateTime; (${socket.handshake.session.user.id})`, io.clientsMap[socket.handshake.session.user.id]);
	next();
}

module.exports = {
	setClientActiveTime: setClientActiveTime,
	updateClientActiveTime: updateClientActiveTime
};