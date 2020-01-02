const socketIo = require("socket.io");
var sharedSession = require("express-socket.io-session");
const logger = require('../../logger/pino');
const messageListeners = require("./listeners/messageListeners");
const roomListeners = require("./listeners/roomListeners");
const joinRooms = require('./joinRooms');
const ensureClientIsAuthenticated = require('./middleware/ensureClientIsAuthenticated');
const { updateClientActiveTime, setClientActiveTime} = require('./middleware/updateActiveTime');

let io;

const initSocket = (server, session) => {
	io = socketIo(server);
	io.clientsMap = {};
	io.use(sharedSession(session));
	io.use(ensureClientIsAuthenticated);
	io.use((socket, next) => setClientActiveTime(io, socket, next));
	
	io.on("connection", socket => {	
		logger.debug("-----SOCKET----- New client connected socket.id: %s", socket.id);
		if (!(socket.handshake.session && socket.handshake.session.user && socket.handshake.session.user.id)) {
			return socket.disconnect();
		}

		socket.use((packet, next) => {
			ensureClientIsAuthenticated(socket, next);
		});

		socket.use((packet, next) => {
			updateClientActiveTime(io, socket, next);
		});

		// TODO - listen for USER_ACTIVE 


		socket.on("disconnect", () => {
			logger.debug("-----SOCKET----- Client disconnected socket.id: %s", socket.id);

			const userId = socket.handshake.session.user.id;
			socket.broadcast.emit("USER_OFFLINE", {
				userId
			});

			delete io.clientsMap[userId];
		});

		joinRooms(socket);
		socket.emit("connected");
		const activeUsersIds = Object.keys(io.clientsMap);
		const activeUsers = activeUsersIds.map(userId => {
			return {
				id: +userId,
				lastActiveOn: io.clientsMap[userId].activeOn
			};
		});
		console.log("activeUsers", activeUsers);
		socket.emit("USERS_ONLINE_ALL", { users: activeUsers });

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