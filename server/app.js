const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('../logger/pino/index');
const pino = require('express-pino-logger')({
	prettyPrint: { colorize: true },
	level: "silent"
})

const routes = require('./routes/index');

const app = express();

app.use(pino);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
	res.send("sszat-backend");
});

app.use('/v1/users',routes.usersRouter);
app.use('/v1/rooms',routes.roomsRouter);
app.use('/v1/messages',routes.messagesRouter);
app.use('/v1/messages/:id/file',routes.messageFilesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	const error = req.app.get('env') === 'development' ? err : {};
	logger.info(req.app.get("env"));
	logger.error(err);
	
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