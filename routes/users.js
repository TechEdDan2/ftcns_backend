"use strict";

const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();

const { ensureRole, authenticateJWT, ensureAdminOrSelf } = require("../middleware/auth");

const { BadRequestError, NotFoundError } = require("../expressError");

const User = require("../models/user");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

/** POST / { user } => { user }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user.
 *
 * Authorization required: admin
 */

router.post("/", ensureRole("admin"), async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.register(req.body);
        return res.status(201).json({ user });
    } catch (err) {
        return next(err);
    }
});

/** GET / => { users: [user, ...] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 */

router.get("/", ensureRole("admin"), async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

/** GET /[username] => { user }
 *
 * Returns { username, role}
 *
 * router.get("/:username", authenticateJWT, async function (req, res, next) 
 * Authorization required: admin or same user
 */

router.get("/:username", authenticateJWT, ensureAdminOrSelf, async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        if (!user) throw new NotFoundError();
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { username, password }
 * Returns { username, role }
 *
 * Authorization required: admin or same user
 */

router.patch("/:username", authenticateJWT, ensureAdminOrSelf, async function (req, res, next) {
    try {
        // Check for empty update
        if (Object.keys(req.body).length === 0) {
            throw new BadRequestError("No data provided for update.");
        }
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { user, token } = await User.update(req.params.username, req.body);
        return res.json({ user, token });
    } catch (err) {
        return next(err);
    }
});

module.exports = router; 