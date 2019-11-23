const router = require('express').Router();
const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const RoomModel = require('../../Models/RoomModel');
const messagesRouter = require('./messagesRouter');
router.use("/:roomId/messages", messagesRouter);


router.get("/", (req, res) => {
	logger.debug("[@Get] rooms/ for-user: %s", req.user.id);
	RoomController.getAll(req.user.id)
		.then(rooms => {
			res.json(rooms);
		})
		.catch(err => next(err));
});

// router.get("/:id", (req, res, next) => {
// 	const id = req.params['id'];
// 	logger.debug("[@Get] room/:id ( id: %O )", id);
// 	RoomController.getById(id)
// 		.then(room => {
// 			const statusCode = room ? 200 : 204
// 			res.status(statusCode).json(room);
// 		})
// 		.catch(err => next(err));
// });

router.post("/", async (req, res, next) => {
	logger.debug("[@Post] room/ %O", req.body);
	
	const {
		roomName,
		owner,
		createBy,
		members
	} = req.body;
	// validation

	const loggedUserId = req.user.id;

	const checkIfUnique = arr => {
		const obj = {};
		arr.forEach(x => {
			obj[x] = true;
		});

		return arr.length === Object.keys(obj).length;
	};

	if (!(roomName && roomName.trim().length > 2 
	&& members && typeof members == "object" && members.length > 1
	&& members.includes(loggedUserId) && checkIfUnique(members)
	&& owner && createBy
	&& owner === createBy && createBy === loggedUserId)) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	const room = new RoomModel(
		undefined,
		roomName,
		loggedUserId, // use session for create
		loggedUserId, // use session
		new Date().toUTCString(),
		members
	);

	try {
		const roomId = await RoomController.create(room);
		logger.debug("create room/ returnedId: %O ", roomId);
		room.id = roomId;
		res.status(201).json(room);
	}
	catch (err) {
		return next(err);
	}
});

router.patch("/", async (req, res, next) => {
	logger.debug("[@Patch] rooms/ %o", req.body);

	const {
		id,
		roomName,
		owner
	} = req.body;

	if (!(roomName && roomName.trim().length > 2 
	&& owner && id)) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	const roomOwner = await RoomController.getById(id);

	if (roomOwner !== req.user.id) {
		res.status(401);
		return next(new Error("Un-auhtorized"));
	}

	const updatedRoom = new RoomModel(
		id,
		roomName,
		owner, // here we can updated owner
		undefined,
		undefined
	);

	RoomController.update(updatedRoom)
		.then(id => {
			logger.info("[@Patch] rooms/ - updated room returnedId: %s ", id);
			res.status(200).json(result);
		})
		.catch(err => next(err));
});

router.delete('/:id', async (req, res, next) => {
	const id = req.params['id'];
	logger.debug("[@Delete] rooms/%s", id);

	if (!id) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	const roomOwner = await RoomController.getById(id);

	if (roomOwner !== req.user.id) {
		res.status(401);
		return next(new Error("Un-auhtorized"));
	}

	RoomController.delete(id)
		.then(result => {
			logger.info("[@Delete] rooms/%s - deleted: %s", id, result);
			res.json(result);
		})
		.catch(err => next(err));
});

module.exports = router;