const logger = require('../../../logger/pino');

function setClientActiveTime(io, socket, next) {
	const userId = socket.handshake.session.user.id;
	io.clientsMap[userId] = {
		socketId: socket.id,
		activeOn: new Date().toUTCString()
	};
	logger.info(`-- SOCKET-IO--middleware; (${userId})`, io.clientsMap[userId]);
	next();
}

function updateClientActiveTime(io, socket, next) {
	const userId = socket.handshake.session.user.id;
	const client = io.clientsMap[userId];
	logger.info(`1 --SOCKET-- updateTime; (${userId})`, client);

	if (client) {
		client.activeOn = new Date().toUTCString();
	}
	else {
		console.log("---- SOCKET ---- NO --- CLIENT -- (", userId, ")");
		io.clientsMap[userId] = {
			socketId: socket.id,
			activeOn: new Date().toUTCString()
		};
	}

	logger.info(`2 --SOCKET-- updateTime; (${userId})`, io.clientsMap[userId]);

	io.emit("USER_ACTIVE", { userId });

	next();
}

module.exports = {
	setClientActiveTime: setClientActiveTime,
	updateClientActiveTime: updateClientActiveTime
};