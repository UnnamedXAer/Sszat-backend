const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const MessageController = require('../../Controllers/MessageController');
const MessageModel = require('../../Models/MessageModel');

const listeners = {
	"MESSAGE_NEW": async (data, socket, io) => {
		const loggedUserId = socket.handshake.session.user.id;
		logger.debug("-----SOCKET----- on MESSAGE_NEW, %O", data);
		logger.debug(`++++++[SOCKET]+++ msg.user.id: ${data.message.createdBy}, session.user: ${socket.handshake.session.user.userName} (${loggedUserId})`);

		// validate Message
		const { message, roomId, tmpId } = data;
		const {
			parts,
			createdBy,
			filesCount,
			files,
			predefinedMsgKey
		} = message;


		if (createdBy !== loggedUserId) {
			logger.error("-----SOCKET----- on MESSAGE_NEW [Un-authorized] loggedUserId: %s, createBy: %s", loggedUserId, createdBy);
			return socket.emit("MESSAGE_NEW_FAIL", {
				payload: {
					roomId,
					tmpId,
					error: "Un-authorized"
				}
			});
		}

		if ((!parts
			|| (roomId !== "public" && +roomId !== parseInt(roomId, 10))
			|| (+filesCount !== parseInt(filesCount, 10))
			|| (typeof files != "object")
			|| files.length === undefined)
			|| (predefinedMsgKey !== null && typeof predefinedMsgKey !== "string")) {
			logger.error("-----SOCKET----- on MESSAGE_NEW [Invalid input] %O", data);
			return socket.emit("MESSAGE_NEW_FAIL", {
				payload: {
					roomId,
					tmpId,
					error: "Invalid input."
				}
			});
		}

		const newMessage = new MessageModel(
			undefined,
			roomId,
			JSON.stringify(parts),
			filesCount,
			loggedUserId,
			new Date().toUTCString(),
			files,
			predefinedMsgKey
		);

		try {
			if (data.roomId != "public") {
				const room = await RoomController.getById(roomId);
				if (!room.members.includes(loggedUserId)) {
					throw new Error("Un-authorized");
				}
				const messageId = await MessageController.create(newMessage);
				logger.debug("-----SOCKET----- MESSAGE_NEW roomId: %s, new message Id: %s,", roomId, messageId);
				newMessage.id = messageId;
			}
			else {
				newMessage.id = tmpId;
			}

			console.log("^^^^^^^^^^^^", newMessage);

			newMessage.parts = parts;
			const payload = {
				type: data.type,
				payload: {
					message: newMessage,
					roomId,
					tmpId
				}
			};

			socket.emit("MESSAGE_NEW_FINISH", payload);
			socket.to(data.roomId).emit("MESSAGE_NEW", payload);
		}
		catch (err) {
			console.log(err);
			logger.error("-----SOCKET----- on MESSAGE_NEW (room: %s) err: %o", roomId, err);
			return socket.emit("MESSAGE_NEW_FAIL", {
				payload: { error: err.message }
			});
		}
	}
}

module.exports = listeners;