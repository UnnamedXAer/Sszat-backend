const logger = require('../../logger/pino');

const ioConnectionCallback = socket => {
	logger.debug("-----SOCKET-----New client connected socket.id: %s", socket.id);
	socket.on("disconnect", () => {
		logger.debug("-----SOCKET-----Client disconnected socket.id: %s", socket.id);
	});


	socket.emit("FromAPI", { DateTime: new Date().toUTCString() });

	socket.on("activeRoom", (roomId) => {
		console.log('roomId', roomId)
		socket.emit("activeRoomUpdated", {roomId});
	})
};

module.exports = ioConnectionCallback;