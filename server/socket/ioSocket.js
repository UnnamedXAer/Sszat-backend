const socketIo = require("socket.io");
var sharedSession = require("express-socket.io-session");
const logger = require('../../logger/pino');
const messageListeners = require("./listeners/messageListeners");
const roomListeners = require("./listeners/roomListeners");
const joinRooms = require('./joinRooms');
const ensureClientIsAuthenticated = require('./middleware/ensureClientIsAuthenticated');
const emitUserIsActive = require('./middleware/emitUserIsActive');

let io;

const initSocket = (server, session) => {
	io = socketIo(server);
	io.clientsMap = {};
	io.use(sharedSession(session));
	io.use(ensureClientIsAuthenticated);
	io.use(emitUserIsActive);

	io.on("connection", socket => {	
		logger.debug("-----SOCKET----- New client connected socket.id: %s", socket.id);
		if (!(socket.handshake.session && socket.handshake.session.user && socket.handshake.session.user.id)) {
			return socket.disconnect();
		}
		io.clientsMap[socket.handshake.session.user.id] = socket.id;

		socket.on("disconnect", () => {
			logger.debug("-----SOCKET----- Client disconnected socket.id: %s", socket.id);

			socket.broadcast.emit("USER_OFFLINE", {
				userId: socket.handshake.session.user.id
			});
		});

		joinRooms(socket);
		socket.emit("connected");

		Object.keys(messageListeners).forEach(key => {
			socket.on(key, (data) => messageListeners[key](data, socket, io));
		});

		Object.keys(roomListeners).forEach(key => {
			socket.on(key, (data) => roomListeners[key](data, socket, io));
		});
		
		// socket.broadcast
		socket.broadcast.emit("USER_ONLINE", { 
			time: new Date().toUTCString(),
			user: socket.handshake.session.user
		});
	});	
};


module.exports = initSocket;