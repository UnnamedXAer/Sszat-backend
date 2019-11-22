const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('../logger/pino/index');
const pino = require('express-pino-logger')({
	logger: logger,
	useLevel: "error",
	autoLogging: false,
	useLevelLabels: true
});
const config = require("config");

//use config module to get the privatekey, if no private key set, end the application
if (!config.get("myprivatekey")) {
	console.error("FATAL ERROR: myprivatekey is not defined.");
	process.exit(1);
}

const routes = require('./routes/index');

const app = express();

app.use(pino);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1/users',routes.usersRouter);
app.use('/v1/rooms', routes.roomsRouter);
app.use('/v1/rooms', routes.versionRootRouter);
app.get("/", (req, res) => {
	res.send({ response: "root" }).status(200);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	const error = req.app.get('env') === 'development' ? err : {};
	logger.info(req.app.get("env"));
	
	logger.error("[ERROR_HANDLER]: %o", err);
	
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = error;

	// render the error page
	res.status(err.status || res.statusCode || 500);
	res.json({
		message: err.message,
		error: error
	});
});


module.exports = app;