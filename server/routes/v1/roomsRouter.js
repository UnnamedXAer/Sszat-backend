const router = require('express').Router();
const logger = require('../../../logger/pino');
const RoomController = require('../../Controllers/RoomController');
const RoomModel = require('../../Models/RoomModel');
const messagesRouter = require('./messagesRouter');
router.use("/:roomId/messages", messagesRouter);

router.get("/", (req, res) => {
	logger.debug("[@Get] rooms/ for-user: %s", req.user.id);
	RoomController.getByUserId(req.user.id)
		.then(rooms => {
			res.json(rooms);
		})
		.catch(err => {
			logger.error(err);
			res.status(500);
			next(err)
		});
});

router.post("/", async (req, res, next) => {
	logger.debug("[@Post] room/ %O", req.body);
	
	const {
		name,
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

	if (!(name && name.trim().length > 2 && name.length <= 50
	&& members && typeof members == "object" && members.length > 1
	&& members.includes(loggedUserId) && checkIfUnique(members)
	&& owner && createBy
	&& owner === createBy && createBy === loggedUserId)) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	const room = new RoomModel(
		undefined,
		name,
		loggedUserId, // use session for create
		loggedUserId, // use session
		new Date().toUTCString(),
		members
	);

	try {
		const roomId = await RoomController.create(room);
		logger.debug("create rooms/ returnedId: %O ", roomId);
		room.id = roomId;
		res.status(201).json(room);
	}
	catch (err) {
		logger.error("[@Post] rooms/ - err: %O", err);
		res.status(500);
		return next(err);
	}
});

router.patch("/", async (req, res, next) => {
	logger.debug("[@Patch] rooms/ %o", req.body);

	const {
		id,
		name,
		owner
	} = req.body;

	if (!(name && name.trim().length > 2 
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
		name,
		owner, // here we can updated owner
		undefined,
		undefined
	);

	RoomController.update(updatedRoom)
		.then(id => {
			logger.info("[@Patch] rooms/ - updated room returnedId: %s ", id);
			res.status(200).json(result);
		})
		.catch(err => {
			res.status(500);
			next(err)
		});
});

router.delete('/:id', async (req, res, next) => {
	const id = req.params['id'];
	logger.debug("[@Delete] rooms/%s", id);

	if ((+id !== parseInt(id, 10))) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	try {
		const room = await RoomController.getById(id);
		if (room.owner !== req.user.id) {
			res.status(401);
			throw new Error("Un-auhtorized");
		}
		const removedRoomId = await RoomController.delete(id)
		logger.info("[@Delete] rooms/%s - deleted: %s", id, removedRoomId);
		res.json(removedRoomId);
	}
	catch (err) { 
		logger.error("[@delete] /rooms/%s err: %o", id, err);
		res.status(500);
		next(err);
	}
});

router.delete('/:roomId/members/:id', async (req, res, next) => {
	const roomId = req.params['roomId'];
	const id = req.params['id'];
	logger.debug("[@Delete] /rooms/%s/members/%s", roomId, id);

	const _id = parseInt(id, 10);
	if ((+id !== _id) || (+roomId !== parseInt(roomId, 10))) {
		res.status(406);
		return next(new Error("Invalid input."));
	}

	try {
		const room = await RoomController.getById(roomId);
		if (room.owner !== req.user.id && req.user.id !== _id) {
			res.status(401);
			throw new Error("Un-auhtorized");
		}
		const removedRecordId = await RoomController.deleteMember(roomId, _id)
		logger.info("[@Delete] /rooms/%s/members/%s - deleted: %s", roomId, _id, removedRecordId);
		res.json(_id);
	}
	catch (err) { 
		logger.error("[@delete] /rooms/%s/members/%s err: %o", roomId, _id, err);
		res.status(500);
		next(err);
	}
});

module.exports = router;