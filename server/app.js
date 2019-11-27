require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
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
const passport = require('passport');
require('../server/auth/passport')(passport);

const routes = require('./routes/index');
const { ensureAuthenticated } = require('./routes/Middleware/ensureAuthenticated');
const middlewareUrlLogger = require('./routes/Middleware/urlLogger');

const app = express();

app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}));
app.use(pino);
app.use(express.json({
	limit: '25mb'
}));
app.use(express.urlencoded({ 
	extended: true,
	limit: '25mb'
}));

const store = new KnexSessionStore({
	knex: require('../config/database'),
	tablename: "sessions" // optional. Defaults to 'sessions'
  });

const expressSession = session({
	secret: "tmpSecret",
	resave: false,
	saveUninitialized: true,
	store: store
	// cookie: {secure: true}
})

app.use(expressSession);
// put after session!
app.use(passport.initialize());
app.use(passport.session());
app.use(middlewareUrlLogger);
app.use('/v1/users', ensureAuthenticated, routes.usersRouter);
app.use('/v1/rooms', ensureAuthenticated, routes.roomsRouter);
app.use('/v1/auth', routes.authRouter);
app.use('/v1', routes.versionRootRouter);
app.get("/", (req, res) => {
	res.send({ response: "root" }).status(200);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	const _env = req.app.get("env");
	const error = _env === 'development' ? err : {};
	logger.info();
	
	logger.error("[ERROR_HANDLER](%s): %o", _env, err);
	
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


module.exports = { app, expressSession };