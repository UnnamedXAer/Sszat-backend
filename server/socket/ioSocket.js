const socketIo = require("socket.io");
const logger = require('../../logger/pino');
const messageListeners = require("./listeners/messageListeners");
let io;
const initSocket = (server) => {
	io = socketIo(server);

	io.on("connection", socket => {
		logger.debug("-----SOCKET----- New client connected socket.id: %s", socket.id);
		socket.on("disconnect", () => {
			logger.debug("-----SOCKET----- Client disconnected socket.id: %s", socket.id);
		});

		Object.keys(messageListeners).forEach(key => {
			socket.on(key, (data) => messageListeners[key](data, socket));
		});

		
		socket.emit("connected", { DateTime: new Date().toUTCString() });

		socket.on("activeRoom", (roomId) => {
			console.log('roomId', roomId);

			socket.emit("activeRoomUpdated", { roomId });
		})
	});	
}

module.exports = initSocket;