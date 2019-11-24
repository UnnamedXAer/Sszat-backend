const router = require('express').Router({ mergeParams: true });
const logger = require('../../../logger/pino');
const MessageModel = require('../../Models/MessageModel');
const MessageController = require('../../Controllers/MessageController');
const RoomController = require('../../Controllers/RoomController');

const messageFilesRouter = require('./messageFilesRouter');
router.use(":messageId/files", messageFilesRouter);

router.get("/", (req, res, next) => {
	const roomId = req.params['roomId'];
	logger.debug("[@Get] rooms/%s/messages", roomId);

	// todo - check if logged user is member of room
	MessageController.getByRoom(roomId)
		.then(messages => {
			res.status(200).json(messages);
		})
		.catch(err => next(err));
});

router.post("/", async (req, res, next) => {
	const roomId = req.params['roomId'];
	const loggedUserId = req.user.id;
	logger.debug("[@Post] rooms/%s/messages %O", roomId, req.body);

	const {
		parts,
		createdBy,
		filesCount
	} = req.body;
	
	if (createdBy !== loggedUserId
		|| !parts
		|| (+filesCount !== parseInt(filesCount, 10))
		|| (+roomId !== parseInt(roomId, 10))
		) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	try {
		const room = await RoomController.getById(roomId);

		if (!room.members.includes(loggedUserId)) {
			res.status(401);
			throw new Error("Un-auhtorized");
		}

		const message = new MessageModel(
			undefined,
			roomId,
			JSON.stringify(parts),
			filesCount,
			loggedUserId,
			new Date().toUTCString()
		);

		const messageId = await MessageController.create(message);
		logger.debug("create /rooms/%s/messages  returnedId: %O ", roomId, messageId);
		message.id = messageId;
		res.status(201).json(message);
	}
	catch (err) {
		logger.error("[@Post] rooms/%s/messages - err: %O", roomId, err);
		res.status(500);
		return next(err);
	}
});

module.exports = router;