const userRouter = require('./v1/userRouter');
const roomRouter = require('./v1/roomRouter');
const messageRouter = require('./v1/messageRouter');
const messageFileRouter = require('./v1/messageFileRouter');

module.exports = { 
	userRouter, 
	roomRouter, 
	messageRouter, 
	messageFileRouter 
};