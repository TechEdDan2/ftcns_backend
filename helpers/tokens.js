const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Return signed JWT from user data. */

function createToken(user) {
    console.assert
    let payload = {
        username: user.username,
        role: user.role || null,
    };

    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };