const router = require('express').Router();


router.get("/", (req, res) => {
	res.send({ response: "v1" }).status(200);
});

module.exports = router;