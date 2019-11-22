const router = require('express').Router(); 
const bcrypt = require("bcrypt");
const UserController = require('../../Controllers/UserController');
const logger = require('../../../logger/pino'); 
const UserModel = require('../../Models/UserModel');
const auth = require("../../Middleware/auth");
const validateUser = require("../../utils/validateUser");

router.get("/current", auth, async (req, res, next) => {
	const id = req.user.id;
	const user = await UserController.getById(id);
	logger.debug("/current %O ", user);
	res.status(200).json(user);
});

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

router.post("/", async (req, res, next) => {
	const body = req.body;
	const { error } = validateUser(body);

	if (error) {
		res.status(400);
		return next(error);
	}

	const existingUser = await UserController.getByEmailAddress(body.emailAddress);

	if (existingUser) {
		res.status(400);
		return next("User with given email address already registered.");
	}

	const user = new UserModel(
		undefined,
		body.emailAddress,
		body.userName,
		body.password,
		body.provider,
		undefined,
		new Date().toUTCString(),
		false
	);

	user.password = await bcrypt.hash(body.password, 10);

	logger.debug("@[Post] user/ %O", user);

	UserController.create(user)
		.then(result => {
			logger.debug("create user/ returnedId: %O ", result);
			user.id = result;
			const token = UserController.generateAuthToken(user);
			res.header("x-auth-token", token).status(201).send({
				id: user.id,
				userName: user.userName,
				emailAddress: user.emailAddress
			});
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