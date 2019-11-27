const logger = require('../../../logger/pino');

const listeners = {
	"MESSAGE_NEW": (data, socket) => {
		logger.debug("-----SOCKET----- on MESSAGE_NEW, %O", data);

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