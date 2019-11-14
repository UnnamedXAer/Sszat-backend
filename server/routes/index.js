const usersRouter = require('./v1/usersRouter');
const roomsRouter = require('./v1/roomsRouter');
const versionRootRouter = require('./v1/versionRootRouter');

module.exports = { 
	roomsRouter,
	usersRouter, 
	versionRootRouter 
};