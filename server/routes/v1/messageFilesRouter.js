const router = require('express').Router();
const logger = require('../../../logger/pino');
const MessageFileController = require('../../Controllers/MessageFileController');

router.get("/:messageId", (req, res, next) => {
	const messageId = req.params['messageId'];
	logger.debug("[@Get] messageFile/:messageId ( messageId: %O )", messageId);
	MessageFileController.getByMessage(messageId)
		.then(messageFiles => {
			res.status(200).json(messageFiles);
		})
		.catch(err => next(err));
});

module.exports = router;