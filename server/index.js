const app = require("./app");
const socketIo = require("socket.io");
const logger = require('../logger/pino/index');
const normalizePort = require('./utils/normalizePort');

var PORT = normalizePort(process.env.PORT || 3330);
const server = (
	(process.env.HOSTING == "LOCAL") ?
		 require('https').createServer(options, app) 
		 : require('http').createServer(app)
);

const io = socketIo(server, {});
let interval;
io.on("connection", socket => {
	logger.debug("New client connected");
	console.log("New client connected, socket.id = ", socket.id);
	socket.emit("FromAPI", {empty: true})

	socket.on("disconnect", () => {
		logger.debug("Client disconnected");
		console.log("Client disconnected");
	});
});

server.listen(PORT, () => {
	logger.info("Server is listening on: ", `${process.env.HOSTING == "LOCAL"? "https":"http"}://localhost:${PORT}`);
});
