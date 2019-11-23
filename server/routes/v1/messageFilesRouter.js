const router = require('express').Router();
const logger = require('../../../logger/pino');
const MessageFileController = require('../../Controllers/MessageFileController');

router.get("/:messageId", (req, res, next) => {
	const messageId = req.params["messageId"];
	const roomId = req.params["roomId"];
	logger.debug("[@Get] rooms/%s/messages/%s/messageFile", roomId, messageId);
	MessageFileController.getByMessage(messageId)
		.then(messageFiles => {
			res.status(200).json(messageFiles);
		})
		.catch(err => {
			return next(err);
		});
});

module.exports = router;