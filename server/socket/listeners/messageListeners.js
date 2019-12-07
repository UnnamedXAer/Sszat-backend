const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const MessageController = require('../../Controllers/MessageController');
const MessageModel = require('../../Models/MessageModel');


const listeners = {
	"MESSAGE_NEW": async (data, socket, io) => {
		const loggedUserId = socket.handshake.session.user.id;
		logger.debug("-----SOCKET----- on MESSAGE_NEW, %O", data);
		// console.log(`++++++[SOCKET]+++ msg.user.id: ${data.message.authorId}, session.user: %c${socket.handshake.session.user.userName} (${loggedUserId})`);
		logger.debug(`++++++[SOCKET]+++ msg.user.id: ${data.message.createdBy}, session.user: ${socket.handshake.session.user.userName} (${loggedUserId})`);
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

			console.log("---SOCKET---members of: "+data.roomId, socket.rooms);
			socket.to(data.roomId).emit("MESSAGE_NEW", payload);
			socket.emit("MESSAGE_NEW", payload);
		}
		else {
			// validate Message
			const { message, roomId, tmpId } = data;
			const {
				parts,
				createdBy,
				filesCount,
				files
			} = message;

			if (createdBy !== loggedUserId
				|| !parts
				|| (+filesCount !== parseInt(filesCount, 10))
				|| (+roomId !== parseInt(roomId, 10))
				|| typeof files != "object"
				|| files.length === undefined
				) {
				logger.debug("-----SOCKET----- on MESSAGE_NEW [Invalid input] %O", data);
				return socket.emit("MESSAGE_NEW_FAIL", {
					payload: {
						roomId,
						tmpId,
						error: "Invalid input."
					}
				});
			}

			try {
				const room = await RoomController.getById(roomId);
				if (!room.members.includes(loggedUserId)) {
					throw new Error("Un-authorized");
				}

				const message = new MessageModel(
					undefined,
					roomId,
					JSON.stringify(parts),
					filesCount,
					loggedUserId,
					new Date().toUTCString(),
					files
				);

				const messageId = await MessageController.create(message);
				logger.debug("-----SOCKET----- MESSAGE_NEW roomId: %s, new message Id: %s,", roomId, messageId);
				message.id = messageId;
				message.parts = parts;
				const payload = {
					type: data.type,
					payload: {
						message,
						roomId,
						tmpId
					}
				};

				socket.emit("MESSAGE_NEW_FINISH", payload);
				socket.to(data.roomId).emit("MESSAGE_NEW", payload);
			// socket.broadcast.emit("MESSAGE_NEW", payload);
			}
			catch (err) {
				logger.error("-----SOCKET----- on MESSAGE_NEW err: %O", roomId, err);
				return socket.emit("MESSAGE_NEW_FAIL", {
					payload: { error: err.message }
				});
			}
		}
	}
}

module.exports = listeners;