const router = require('express').Router();
const UserController = require('../../Controllers/UserController');
const logger = require('../../../logger/pino'); 
const UserModel = require('../../Models/UserModel');

router.get("/", (req, res, next) => {

	UserController.getAll()
		.then(users => {
			res.json(users);
		})
		.catch(err => next(err));
});

router.get("/:id", (req, res, next) => {
	const id = req.params['id'];
	logger.debug("user/:id ( id: %O )", id);
	UserController.getById(id)
		.then(user => {
			const statusCode = user ? 200 : 204
			res.status(statusCode).json(user);
		})
		.catch(err => next(err));
});

router.post("/", (req, res, next) => {
	// validation
	const body = req.body;

	const user = new UserModel(
		undefined,
		body.emailAddress,
		body.userName,
		body.provider,
		undefined,
		new Date().toUTCString()
	);

	logger.debug("@[Post] user/ %O", user);

	UserController.create(user)
		.then(result => {
			logger.debug("create user/ returnedId: %O ", result);
			res.status(201).json(result);
		})
		.catch(err => next(err));
});

router.patch("/", (req, res, next) => {
	logger.debug("@[Patch] user/");

	const body = req.body;

	const updatedUser = new UserModel(
		body.id,
		body.emailAddress,
		body.userName,
		body.provider,
		undefined,
		new Date().toUTCString()
	);

	UserController.update(updatedUser)
		.then(result => {
			logger.debug("updated user/ returnedId: %O ", result);
			res.status(200).json(result);
		})
		.catch(err => next(err));
});

module.exports = router;