const router = require('express').Router({ mergeParams: true });
const logger = require('../../../logger/pino');
const MessageController = require('../../Controllers/MessageController');

const messageFilesRouter = require("./messageFilesRouter");
router.use(":messageId/files",messageFilesRouter);

router.get("/", (req, res, next) => {
	const roomId = req.params['roomId'];
	logger.debug("[@Get] rooms/%s/messages", roomId);
	MessageController.getByRoom(roomId)
		.then(messages => {
			res.status(200).json(messages);
		})
		.catch(err => next(err));
});

module.exports = router;