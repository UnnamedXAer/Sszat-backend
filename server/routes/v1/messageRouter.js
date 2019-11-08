const router = require('express').Router();
const logger = require('../../../logger/pino');
const MessageController = require('../../Controllers/MessageController');
const MessageModel = require('../../Models/MessageModel');

router.get("/:roomId", (req, res, next) => {
	const roomId = req.params['roomId'];
	logger.debug("[@Get] message/:roomId ( roomId: %O )", roomId);
	MessageController.getByRoom(roomId)
		.then(messages => {
			res.status(200).json(messages);
		})
		.catch(err => next(err));
});

router.post("/", (req, res, next) => {
	// validation
	const body = req.body;

	const message = new MessageModel(
		undefined,
		body.roomId,
		body.messageParts,
		body.messageFileCount,
		body.createBy,
		undefined
	);

	logger.debug("[@Post] message/ %O", message);

	MessageController.create(message)
		.then(result => {
			logger.debug("create message/ returnedId: %O ", result);
			res.status(201).json(result);
		})
		.catch(err => next(err));
});

module.exports = router;