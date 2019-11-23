const usersRouter = require('./v1/usersRouter');
const roomsRouter = require('./v1/roomsRouter');
const versionRootRouter = require('./v1/versionRootRouter');
const authRouter = require('./v1/authRouter');

module.exports = { 
	roomsRouter,
	usersRouter, 
	versionRootRouter,
	authRouter
};