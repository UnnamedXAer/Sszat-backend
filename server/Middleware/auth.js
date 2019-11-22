const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
	//get the token from the header if present
	const token = req.headers["x-access-token"] || req.headers["authorization"];
	//if no token found, return response (without going to the next middleware)
	if (!token) {
		 res.status(401)
		return next("Access denied. No token provided.");
	}

	try {
		const key = config.get("myprivatekey");
		//if can verify the token, set req.user and pass to next middleware
		const decoded = jwt.verify(token, key);
		req.user = decoded;
		next();
	} catch (ex) {
		//if invalid token
		res.status(400);
		next("Invalid token.");
	}
};