const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const UserController = require('../Controllers/UserController');
const UserModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const logger = require('../../logger/pino');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({
            usernameField: "emailAddress",
            passwordField: "password"
        }, async (emailAddress, password, done) => {
            try {
                const user = await UserController.getByEmailAddress(emailAddress);
                if (!user) {
                    return done(null, false, { message: "Email Address or Password are incorrect." });
                }
                const isPasswordMatch = await bcrypt.compare(password, user.password);

                if (isPasswordMatch) {
                    user.password = undefined;
                    return done(null, user);
                }
                else {
                    return done(null, false, { message: "Email Address or Password are incorrect." })
                }
            }
            catch (err) {
                logger.error("[ LocalStrategy ] error: %o", err);
                return done(err);
            }
        })
    );

    passport.use(
        new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: "/v1/auth/github/callback",
			scope: ["read:user"]
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                logger.debug("[ GitHubStrategy ] profile: %o", profile);

                let emailAddress;

                if (profile.emails && profile.emails[0]) {
                    emailAddress = profile.emails[0].value;
                }
                else {
                    return done(null, false, { message: "Fail to Auth with GitHub." });
                }

                let user = await UserController.getByEmailAddress(emailAddress);
                if (!user) {
                    let avatarUrl;
                    if (profile.photos && profile.photos[0]) {
                        avatarUrl = profile.photos[0].value;
                    }
    
                    const newGitHubUser = new UserModel(
                        undefined,
                        emailAddress,
                        profile.username,
                        undefined,
                        profile.provider,
                        new Date().toUTCString(),
                        new Date().toUTCString(),
                        profile.displayName,
                        profile.id,
                        avatarUrl,
                        profile.profileUrl,
                        accessToken,
                        refreshToken
                    );

                    const createdUserId = await UserController.create(newGitHubUser);
                    logger.info("[ GitHubStrategy ] - new user created: %s", createdUserId);
                    user = await UserController.getById(createdUserId);
                }
				user.password = undefined;
				return done(null, user);
            }
            catch (err) {
                logger.error("[ GitHubStrategy ] error: %o", err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    // when the cookie comes back to us from the browser when make request we receive that id then we find the user that mach to given id
    passport.deserializeUser(async (id, done) => {
        try {
			const user = await UserController.getById(id);
            if (user) {
                done(null, user);
            }
            else {
                done(new Error("User does not exists!"));
            }
        }
        catch (err) {
            logger.error("[ deserializeUser ] error: %o", err);
            done(err, false);
        }
    });

}