"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload 
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        // console.log("Authorization Header:", authHeader); // Log the header
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            // console.log("Token:", token); // Log the token
            res.locals.user = jwt.verify(token, SECRET_KEY);
            // console.log("Decoded User:", res.locals.user); // Log the decoded user
        }
        return next();
    } catch (err) {
        return next();
    }
}


/**
 * Middleware to verify if a user has a specific role.
 * 
 * Roles could include 'admin', 'scout', 'coach', etc. depending 
 *  the on application's needs.
 * 
 * Usage in your routes:
 * router.post('/stats', ensureRole('admin'), updateStats);
 * router.post('/notes', ensureRole('scout'), addNote);
 * 
 * @param {string} requiredRole - The role required to access the route.
 * @returns {function} Middleware function that checks the user's role.
 * @throws {UnauthorizedError} If the user does not have the required role.
 */
function ensureRole(requiredRole) {
    return (req, res, next) => {
        try {
            if (!res.locals.user || res.locals.user.role !== requiredRole) {
                throw new UnauthorizedError(`You must have the role of '${requiredRole}' to perform this action.`);
            }
            return next();
        } catch (err) {
            return next(err);
        }
    };
}


/**
 * Middleware to ensure that the user is the same as the username in the route or an admin.
 * 
 * If not, raises Unauthorized.
 * 
 * 
 */
function ensureAdminOrSelf(req, res, next) {
    try {
        // Check the response locals for the user and their admin status or username match
        const user = res.locals.user;
        if (!user) throw new UnauthorizedError();
        if (!(user?.role === 'admin' || user?.username === req.params.username)) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (err) {
        return next(err);
    }
}


module.exports = {
    authenticateJWT,
    ensureRole,
    ensureAdminOrSelf,
};
