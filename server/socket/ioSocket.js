const socketIo = require("socket.io");
var sharedSession = require("express-socket.io-session");
const logger = require('../../logger/pino');
const messageListeners = require("./listeners/messageListeners");
let io;
const initSocket = (server, session) => {
	io = socketIo(server);
	io.use(sharedSession(session));

	io.on("connection", socket => {
		logger.debug("-----SOCKET----- New client connected socket.id: %s", socket.id);
		socket.on("disconnect", () => {
			logger.debug("-----SOCKET----- Client disconnected socket.id: %s", socket.id);

			socket.broadcast.emit("USER_OFFLINE", {
				userId: socket.handshake.session.user.id
			});
		});

		socket.emit("connected");

		// socket.join("public", (err) => {
		// 	if (err) {
		// 		socket.emit("room_join_error", {roomId: "public", error: err});
		// 	}
		// 	else {
		// 		socket.broadcast.emit("room_join", {
		// 			user: socket.handshake.session.user
		// 		});
		// 	}
		// });

		Object.keys(messageListeners).forEach(key => {
			socket.on(key, (data) => messageListeners[key](data, socket));
		});

		
		// socket.broadcast
		socket.broadcast.emit("USER_ONLINE", { 
			time: new Date().toUTCString(),
			user: socket.handshake.session.user
		});
	});	
};


module.exports = initSocket;