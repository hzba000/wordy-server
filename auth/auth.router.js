const express = require('express');
const jwt = require('jsonwebtoken');

const { localPassportMiddleware, jwtPassportMiddleware } = require('../auth/auth.strategy');
const { JWT_SECRET, JWT_EXPIRY } = require('../config.js');

const authRouter = express.Router();

//This is the form in which the JWT token is returned to the user
function createJwtToken(user) {
    return jwt.sign({ user }, JWT_SECRET, {
        subject: user.username,
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

//Sends credentials for JWT token tradeoff
authRouter.post('/login', localPassportMiddleware, (request, response) => {
    const user = request.user.serialize();
    const jwtToken = createJwtToken(user);
    response.json({ jwtToken, user });
});

//Refreshes already sent credentials for JWT token renewal
authRouter.post('/refresh', jwtPassportMiddleware, (request, response) => {
    const user = request.user;
    const jwtToken = createJwtToken(user);
    response.json({ jwtToken, user });
});

module.exports = { authRouter };