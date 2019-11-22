const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
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

router.post("/login", async (req, res, next) => {
	passport.authenticate("local", { }, (err, user, info) => {
		if (err) {
			res.status(500);
			return next(err);
		}
		if (info || !user) {
			res.status(406)
			return next((info ? info.message : "Invalid credentials."));
		}

		req.login(user, (err) => {
			if (err) {
				res.status(500);
				return next(err); 
			}
			return res.status(201).send(user);
		});

	})(req, res, next);
});

router.post("/register", async (req, res, next) => {
	// validation
	const {
		emailAddress,
		emailAddressConfirmation,
		userName,
		password,
		passwordConfirmation,
		provider
	} = req.body;

	if (!provider) {
		provider = "local";
	}

	if (!(password && password == passwordConfirmation 
		&& emailAddress && emailAddress == emailAddressConfirmation
		&& userName && userName.length > 2)) {
			res.status(406);
			return next("Invalid input.");
		}

		const hashPssword = await bcrypt.hash(password, await bcrypt.genSalt(10));

		const joinDate = new Date().toUTCString();

		const user = new UserModel(
			undefined,
			emailAddress,
			userName,
			hashPssword,
			provider,
			joinDate,
			joinDate
			);

	logger.debug("@[Post] user/ %O", user);

	UserController.create(user)
		.then(id => {
			logger.debug("create user/ returnedId: %O ", result);
			const createdUser = UserController.getById(id);
			res.status(201).json(createdUser);
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

router.get("/logout", (req, res) => {
	req.logout();
	res.sendStatus(200);
})

module.exports = router;