const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../user/user.model');
const { JWT_SECRET } = require('../config');

//This strategy is used to authenticate based on user info and password (What we need to trade for a JWT...)
//This will be used with our passport Middleware to intercept requests from client to host
const localStrategy = new LocalStrategy((username, password, passportVerify) => {
    let user;
    User.findOne({ username: username }).then(_user => {
        user = _user;
        if (!user) {
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            });
        }
        return user.validatePassword(password);
    }).then(isValid => {
        if (!isValid) {
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            });
        }
        return passportVerify(null, user);
    }).catch(err => {
        if (err.reason === 'LoginError') {
            return passportVerify(null, false, err.message);
        }
        return passportVerify(err, false);
    });
});

//This strategy is used to authenticate based on JWT token
//This will be used with passport Middleware to intercept requests from client to host
const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (token, done) => {
        done(null, token.user);
    }
);

const localPassportMiddleware = passport.authenticate('local', { session: false });
const jwtPassportMiddleware = passport.authenticate('jwt', { session: false });

module.exports = {
    localStrategy,
    jwtStrategy,
    localPassportMiddleware,
    jwtPassportMiddleware
};