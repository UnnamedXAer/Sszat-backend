const app = require("./app");
const logger = require('../logger/pino/index');
const normalizePort = require('./utils/normalizePort');

var PORT = normalizePort(process.env.PORT || 3330);
const http = (
	(process.env.HOSTING == "LOCAL") ?
		 require('https').createServer(options, app) 
		 : require('http').createServer(app)
);

http.listen(PORT, () => {
	logger.info("Server is listening on: ", `${process.env.HOSTING == "LOCAL"? "https":"http"}://localhost:${PORT}`);
});