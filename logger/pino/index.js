const logger = require('pino')({
	level: "debug", 
	levelVal: "debug",
	prettyPrint: { colorize: true }
});


module.exports = logger;