const router = require('express').Router();
const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const RoomModel = require('../../Models/RoomModel');

const messagesRouter = require('./messagesRouter');
router.use("/:roomId/messages", messagesRouter);


router.get("/", (req, res) => {
	logger.debug("[@Get] room/ ");
	RoomController.getAll()
		.then(rooms => {
			res.json(rooms);
		})
		.catch(err => next(err));
});

router.get("/:id", (req, res, next) => {
	const id = req.params['id'];
	logger.debug("[@Get] room/:id ( id: %O )", id);
	RoomController.getById(id)
		.then(room => {
			const statusCode = room ? 200 : 204
			res.status(statusCode).json(room);
		})
		.catch(err => next(err));
});

router.post("/", (req, res, next) => {
	// validation
	const body = req.body;

	const room = new RoomModel(
		undefined,
		body.roomName,
		body.owner, // use session for create
		body.createBy, // use session
		undefined
	);

	logger.debug("[@Post] room/ %O", room);

	RoomController.create(room)
		.then(result => {
			logger.debug("create room/ returnedId: %O ", result);
			res.status(201).json(result);
		})
		.catch(err => next(err));
});

router.patch("/", (req, res, next) => {
	logger.debug("[@Patch] room/");

	const body = req.body;

	const updatedRoom = new RoomModel(
		body.id,
		body.roomName,
		body.owner,
		undefined,
		undefined
	);

	RoomController.update(updatedRoom)
		.then(result => {
			logger.debug("updated room/ returnedId: %O ", result);
			res.status(200).json(result);
		})
		.catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
	const id = req.params['id'];
	logger.debug("[@Delete] room/:id", id);

	RoomController.delete(id)
		.then(result => {
			res.json(result);
		})
		.catch(err => next(err));
});

module.exports = router;