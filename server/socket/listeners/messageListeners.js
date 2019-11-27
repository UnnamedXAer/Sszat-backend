const logger = require('../../../logger/pino');

const listeners = {
	"MESSAGE_NEW": (data, socket) => {
		logger.debug("-----SOCKET----- on MESSAGE_NEW, %O", data);
		// console.log(`++++++[SOCKET]+++ msg.user.id: ${data.message.authorId}, session.user: %c${socket.handshake.session.user.userName} (${socket.handshake.session.user.id})`);
		logger.debug(`++++++[SOCKET]+++ msg.user.id: ${data.message.authorId}, session.user: ${socket.handshake.session.user.userName} (${socket.handshake.session.user.id})`);
		if (data.roomId == "public") {
			const payload = {
				type: data.type,
				payload: {
					message: {
						...data.message,
						id: Math.random() * 100
					},
					roomId: data.roomId,
					tmpId: data.tmpId
				}
			};

			socket.broadcast.emit("MESSAGE_NEW", payload);
			socket.emit("MESSAGE_NEW_FINISH", payload);
		}
		else {
			// validate Message
		}
	},

}

module.exports = listeners;