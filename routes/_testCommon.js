const bcrypt = require("bcryptjs");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testNoteIds = [];

/* Common functions for tests. */

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM notes");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");

    await db.query(`
        INSERT INTO users (username, password_hash)
        VALUES ('user1', $1),
               ('user2', $2)
        RETURNING id`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ]
    );


}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    testNoteIds,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};  