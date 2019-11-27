const socketIo = require("socket.io");
var sharedsession = require("express-socket.io-session");
const logger = require('../../logger/pino');
const messageListeners = require("./listeners/messageListeners");
let io;
const initSocket = (server, session) => {
	io = socketIo(server);
	io.use(sharedsession(session));

	io.on("connection", socket => {
		logger.debug("-----SOCKET----- New client connected socket.id: %s", socket.id);
		socket.on("disconnect", () => {
			logger.debug("-----SOCKET----- Client disconnected socket.id: %s", socket.id);
		});

		Object.keys(messageListeners).forEach(key => {
			socket.on(key, (data) => messageListeners[key](data, socket));
		});

		
		// socket.broadcast
		io.emit("USER_JOINED", { 
			DateTime: new Date().toUTCString(),
			session: socket.handshake.session.user
		});
	});	
};


module.exports = initSocket;