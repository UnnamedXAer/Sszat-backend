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

const io = socketIo(server);
const ioConnectionCallback = require('./socket/ioConnection');
io.on("connection", ioConnectionCallback);


server.listen(PORT, () => {
	logger.info("Server is listening on: ", `${process.env.HOSTING == "LOCAL"? "https":"http"}://localhost:${PORT}`);
});
