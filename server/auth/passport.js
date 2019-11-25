const LocalStrategy = require('passport-local').Strategy;
const UserController = require('../Controllers/UserController');
const bcrypt = require('bcrypt');

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
            done(err, false);
        }
    });

}