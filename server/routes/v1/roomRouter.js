const router = require('express').Router();

router.get("/", (req, res) => {
	res.send(["room1", "room2"]);
})

module.exports = router;