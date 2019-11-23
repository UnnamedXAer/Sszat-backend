const router = require('express').Router();
const logger = require('../../../logger/pino'); 


router.get("/", (req, res) => {
	logger.info("[@Get] /v1");
	res.send({ response: "v1" }).status(200);
});

module.exports = router;