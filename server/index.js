const { app, expressSession } = require("./app");
const logger = require('../logger/pino/index');
const normalizePort = require('./utils/normalizePort');

var PORT = normalizePort(process.env.PORT || 3330);
const server = (
	(process.env.HOSTING == "LOCAL") ?
		 require('https').createServer(options, app) 
		 : require('http').createServer(app)
);

require("./socket/ioSocket")(server, expressSession);

server.listen(PORT, () => {
	logger.info("Server is listening on: ", `${process.env.HOSTING == "LOCAL"? "https":"http"}://localhost:${PORT}`);
});
