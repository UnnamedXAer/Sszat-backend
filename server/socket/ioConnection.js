const logger = require('../../logger/pino');

const ioConnectionCallback = socket => {
	logger.debug("-----SOCKET----- New client connected socket.id: %s", socket.id);
	socket.on("disconnect", () => {
		logger.debug("-----SOCKET----- Client disconnected socket.id: %s", socket.id);
	});

	socket.on("new-message", data => {
		logger.debug("-----SOCKET----- on new-message, %O", data);
		socket.broadcast.emit("new-message", { ...data, message: { ...data.message, id: 9999 } });
		socket.emit("new-message-completed", { ...data, message: { ...data.message, id: 9999 } });
	});

	socket.emit("connected", { DateTime: new Date().toUTCString() });

	socket.on("activeRoom", (roomId) => {
		console.log('roomId', roomId);
		
		socket.emit("activeRoomUpdated", {roomId});
	})
};

module.exports = ioConnectionCallback;