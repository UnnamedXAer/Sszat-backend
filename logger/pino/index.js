const logger = require('pino')({
	level: process.env.PINO_LEVEL, 
	levelVal: process.env.PINO_LEVEL_VAL,
	prettyPrint: { 
		colorize: true,
		crlf: true,
		translateTime: true
	}
});


module.exports = logger;