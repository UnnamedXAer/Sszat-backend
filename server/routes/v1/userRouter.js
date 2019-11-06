const router = require('express').Router();
const UserController = require('../../Controllers/UserController');
const logger = require('../../../logger/pino'); 

router.get("/", (req, res) => {

	UserController.getAll()
		.then(users => res.json(users));
});

router.get("/:id", (req, res) => {
	const id = req.params['id'];
	logger.debug("user/:id ( id: %O )", id);
	UserController.getById(id).then(user => res.json(user));
});

router.post("/", (req, res) => {
	// validation
	const user = {...req.body};
	logger.debug("@[Post] user/ %O", user);

	UserController.create().then(result => {
		logger.debug("create user/ returnedId: %O ", result);
		res.status(201).json(result);
	});
})

module.exports = router;