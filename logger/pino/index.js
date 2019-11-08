const logger = require('pino')({
	level: "debug", 
	levelVal: "debug",
	prettyPrint: { 
		colorize: true,
		crlf: true,
		translateTime: true
	}
});


module.exports = logger;