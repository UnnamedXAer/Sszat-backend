const usersRouter = require('./v1/usersRouter');
const roomsRouter = require('./v1/roomsRouter');
const messagesRouter = require('./v1/messagesRouter');
const messageFilesRouter = require('./v1/messageFilesRouter');

module.exports = { 
	usersRouter, 
	roomsRouter, 
	messagesRouter, 
	messageFilesRouter 
};