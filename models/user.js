"use strict";

const db = require("../db");
const bcrypt = require("bcryptjs");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
    /**
     * Authenticate a user with their username and password.
     *
     * This method verifies the provided username and password against the database.
     * If the credentials are valid, it returns the user's details.
     *
     * Returns an object containing:
     *   { username, role, isAdmin }
     *
     * Throws an `UnauthorizedError` if the username is not found or the password is incorrect.
     *
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {Object} The authenticated user's details.
     * @throws {UnauthorizedError} If authentication fails.
     */

    static async authenticate(username, password) {
        // try to find the user first
        const result = await db.query(
            `SELECT username,
                  password_hash AS password,
                  role
           FROM users
           WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            // compare hashed password to stored hash
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /** Register a new user with the provided data.
     *
     * This method creates a new user in the database after ensuring the username
     * is unique and hashing the password for security.
     *
     * The `data` object should include:
     *   - `username` (string): The desired username.
     *   - `password` (string): The user's password.
     *   - `role` (string, optional): The user's role (default: 'scout').
     *   - `isAdmin` (boolean, optional): Whether the user has admin privileges (default: false).
     *
     * Returns an object containing:
     *   { id, username, role, isAdmin, createdAt }
     *
     * Throws a `BadRequestError` if the username already exists.
     *
     * @param {Object} data - The user data for registration.
     * @returns {Object} The newly registered user's details.
     * @throws {BadRequestError} If the username is a duplicate.
     */

    static async register({ username, password, role = 'scout' }) {
        // Check for duplicate username
        const duplicateCheck = await db.query(
            `SELECT username
             FROM users
             WHERE username = $1`,
            [username],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        // Insert the new user into the database
        const result = await db.query(
            `INSERT INTO users
             (id, username, password_hash, role)
             VALUES (gen_random_uuid(), $1, $2, $3)
             RETURNING id, username, role, created_at AS "createdAt"`,
            [
                username,
                hashedPassword,
                role,
            ],
        );

        return result.rows[0];
    }

    /** Find all users.
     *
     * Returns an array of user objects, each containing:
     *   { username, role, isAdmin }
     *
     * @returns {Array<Object>} A list of all users.
     */

    static async findAll() {
        const result = await db.query(
            `SELECT username,
                  role
           FROM users
           ORDER BY username`,
        );

        return result.rows;
    }

    /** Given a username, return data about user.
     *
     * This method fetches the user's details and their associated applications.
     *
     * Returns an object containing:
     *   { username, role, isAdmin, apps }
     * where `apps` is an array of job IDs the user has applied for.
     *
     * Throws a `NotFoundError` if the user does not exist.
     *
     * @param {string} username - The username of the user to retrieve.
     * @returns {Object} The user's details and applications.
     * @throws {NotFoundError} If the user is not found.
     */

    static async get(username) {
        const userRes = await db.query(
            `SELECT username,
                  role
           FROM users
           WHERE username = $1`,
            [username],
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        //Add a object key like the company model
        const resUserApps = await db.query(
            `SELECT a.job_id
      FROM applications AS a
      WHERE a.username = $1`, [username]
        );

        user.apps = resUserApps.rows.map(a => a.job_id);

        return user;
    }

    /**
     * Update user data with the provided `data` object.
     *
     * This method performs a partial update, meaning it only 
     *  modifies the fields included in the `data` object. 
     *  Fields not provided in `data` remain unchanged.
     *
     * The `data` object can include the following fields:
     *   - `password` (string): The user's password (will be 
     *      hashed before saving).
     * 
     *
     * Throws a `NotFoundError` if the user does not exist.
     *
     * WARNING: This method allows updating sensitive fields 
     *  such as `password` and `isAdmin`. Ensure that all 
     *  inputs are properly validated before calling this method 
     *  to avoid security risks.
     *
     * @param {string} username - The username of the user to update.
     * @param {Object} data - The fields to update and their new values.
     * @returns {Object} The updated user data.
     * @throws {NotFoundError} If the user is not found.
     */

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                role: "role",
            });
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                  SET ${setCols} 
                  WHERE username = ${usernameVarIdx} 
                  RETURNING username,
                    role`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        return user;
    }

    /** Delete a user from the database.
     *
     * This method removes the user identified by the given username.
     *
     * Throws a `NotFoundError` if the user does not exist.
     *
     * @param {string} username - The username of the user to delete.
     * @returns {undefined}
     * @throws {NotFoundError} If the user is not found.
     */

    static async remove(username) {
        let result = await db.query(
            `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
            [username],
        );
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }



} //END OF USER


module.exports = User;
