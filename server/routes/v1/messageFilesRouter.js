const router = require('express').Router();
const logger = require('../../../logger/pino');
const MessageFileController = require('../../Controllers/MessageFileController');
const MessageFileModel = require('../../Models/MessageFileModel');

router.get("/:messageId", (req, res, next) => {
	const messageId = req.params['messageId'];
	logger.debug("[@Get] messageFile/:messageId ( messageId: %O )", messageId);
	MessageFileController.getByMessage(messageId)
		.then(messageFiles => {
			res.status(200).json(messageFiles);
		})
		.catch(err => next(err));
});

router.post("/", (req, res, next) => {
	// i assume that every file will be send separately
	// validation
	const body = req.body;

	const messageFile = new MessageFileModel(
		undefined,
		body.messageId,
		body.fileName,
		body.fileExt,
		body.fileData,
		body.createBy, // use session
		undefined
	);

	logger.debug("[@Post] messageFile/ %O", messageFile);

	MessageFileController.create(messageFile)
		.then(result => {
			logger.debug("create messageFile/ returnedId: %O ", result);
			res.status(201).json(result);
		})
		.catch(err => next(err));
});

module.exports = router;