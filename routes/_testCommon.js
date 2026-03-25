const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../app");

let testJwt;

/** Function to log in as a test user and retrieve a valid JWT */
async function getTestJwt() {
    const resp = await request(app)
        .post("/auth/token")
        .send({ username: "user1", password: "password1" });
    testJwt = resp.body.token;
}

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testNoteIds = [];

/* Common functions for tests. */

async function commonBeforeAll() {
    try {
        // // noinspection SqlWithoutWhere
        // await db.query("DELETE FROM events");
        // // noinspection SqlWithoutWhere
        // await db.query("DELETE FROM teams");
        // // noinspection SqlWithoutWhere
        // await db.query("DELETE FROM notes");
        // // noinspection SqlWithoutWhere
        // await db.query("DELETE FROM users");

        // Clear all tables
        await db.query("TRUNCATE events RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE teams RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE notes RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE users RESTART IDENTITY CASCADE");

        // Insert test data for events, teams, and users
        const event1 = await db.query(`
        INSERT INTO events (event_code, region_code, event_name, event_date, city, state_prov, is_active)
        VALUES ('USNYLIPORT2', 'US', 'New York City Regional', '2024-03-15', 'New York', 'NY', true)
        RETURNING event_code`
        );

        // Store the event code for use in tests
        const eventCode = event1.rows[0].event_code;

        // Insert a team and users for testing
        const team1 = await db.query(`
        INSERT INTO teams (team_number, team_name, rookie_year)
        VALUES (0, 'Team 0', 2014)
        RETURNING team_number`
        );

        // Store the team number for use in tests
        const teamNumber = team1.rows[0].team_number;

        // Insert test users
        const TEST_USERS = [
            { username: "user1", password: "password1", role: "scout" },
            { username: "user2", password: "password2", role: "scout" },
        ];

        // Insert users
        const resUsers = await db.query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, $3),($4, $5, $6)
            RETURNING id`,
            [
                TEST_USERS[0].username, await bcrypt.hash(TEST_USERS[0].password, BCRYPT_WORK_FACTOR), TEST_USERS[0].role,
                TEST_USERS[1].username, await bcrypt.hash(TEST_USERS[1].password, BCRYPT_WORK_FACTOR), TEST_USERS[1].role,
            ]
        );


        // Insert notes linked to the team and event
        const resNotes = await db.query(`
            INSERT INTO notes (team_number, event_code, username, note_title, note_text)VALUES ($1, $2, $3, 'First Round', 'Great performance!'),
            ($1, $2, $4, 'Auto Issues', 'Needs work on autonomous.')
            RETURNING id`,
            [teamNumber, eventCode, 'user1', 'user2']
        );

        testNoteIds.push(...resNotes.rows.map(row => row.id));

        // Generate a test JWT
        await getTestJwt();

    } catch (err) {
        console.error("Error in commonBeforeAll:", err);
        throw err;
    }

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
    testJwt,
    getTestJwt,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};