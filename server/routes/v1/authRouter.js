const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const UserController = require('../../Controllers/UserController');
const logger = require('../../../logger/pino'); 
const UserModel = require('../../Models/UserModel');

router.get('/github',
  passport.authenticate('github', { scope: [ "read:user" ], failWithError: true, failureMessage: " /github -> Unable to auth With GitHub" }));

router.get("/github/callback", 
passport.authenticate('github', { failWithError: true, failureMessage: "/github/callback -> Unable to auth With GitHub" }),
	async (req, res, next) => {
		const { query } = req;
		const { code } = query;
		console.log("code", code);
		res.req.session.user = res.req.user;
		// res.status(200).send(req.user);
		res.send(`<script>
		window.authUser = ${JSON.stringify(req.user)};
		window.document.authUser = ${JSON.stringify(req.user)};
		document.authUser = ${JSON.stringify(req.user)};
		window.parent.authUser = ${JSON.stringify(req.user)};
		console.log(${JSON.stringify(req.user)});
		window.parent.postMessage("authCompleted", authUser);
		</script>`);
	});

router.get("/logout", (req, res) => {
	logger.debug("/logout : Try to log-Out %O", req.user);
	delete req.session.user;
	req.logout();
	res.sendStatus(200);
});

router.post("/login", async (req, res, next) => {
    logger.debug("/login : Try to log-In as: %O", req.body);
	passport.authenticate("local", { }, (err, user, info) => {
        logger.debug("/login authenticate err: %O, info: %O, user: %O", err, info, user);
		if (err) {
			res.status(500);
			return next(err);
		}
		if (info || !user) {
            res.status(406);
            logger.info("/login - fail: %s", (info ? info.message : "Invalid credentials."));
			return next(new Error(info ? info.message : "Invalid credentials."));
		}

		req.login(user, (err) => {
			if (err) {
                res.status(500);
                logger.error("/login - req.login user: %O, err: %O", user, err);
				return next(err); 
			}
			
			res.req.session.user = res.req.user;
			return res.status(200).send(user);
		});

	})(req, res, next);
});

router.post("/register", async (req, res, next) => {
    logger.debug("/register : Try to Register as: %O", req.body);
	// validation
	const {
		emailAddress,
		emailAddressConfirmation,
		userName,
		password,
		passwordConfirmation
	} = req.body;

	const provider = req.body.provider || "local";

	if (!(password && password == passwordConfirmation 
		&& emailAddress && emailAddress == emailAddressConfirmation
		&& userName && userName.length > 2)) {
			res.status(406);
			return next(new Error("Invalid input."));
		}

		const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

		const joinDate = new Date().toUTCString();

		const user = new UserModel(
			undefined,
			emailAddress,
			userName,
			hashPassword,
			provider,
			joinDate,
			joinDate
		);

	UserController.create(user)
		.then(async id => {
            const createdUser = await UserController.getById(id);
            logger.info("/register - create user: %O ", createdUser);
            
            req.login(createdUser, (err) => {
                if (err) {
                    res.status(500);
                    logger.error("/register - req.login user: %O, err: %O", user, err);
                    return next(err); 
                }
				res.req.session.user = res.req.user;
				return res.status(201).send(createdUser);
            });
		})
		.catch(err => {
            res.status(500);
            logger.error("/register - fail to insert user, err: %O ", err);
            return next(err);
        });
});

module.exports = router;