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
        VALUES ('u1', $1),
               ('u2', $2)
        RETURNING id`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ]
    );

    const results = await db.query(`
        INSERT INTO notes (team_number, event_code, scout_id, note_title, note_text)
        VALUES (1234, 'EVT1', 1, 'Note 1', 'This is the first note.'),
               (1234, 'EVT1', 2, 'Note 2', 'This is the second note.'),
               (5678, 'EVT2', 1, 'Note 3', 'This is the third note.')
        RETURNING id`
    );
    testNoteIds.splice(0, testNoteIds.length, ...results.rows.map(r => r.id));
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