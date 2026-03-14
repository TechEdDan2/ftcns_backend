const bcrypt = require('bcryptjs');

const { BCRYPT_WORK_FACTOR } = require("../config");
const { createToken } = require("../helpers/tokens");

const { db } = require("../db.js");
const { User } = require("./user.js");
const { Note } = require("./note.js");

const fakeNoteIds = [];

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM notes");

    await User.register({
        username: "scout1",
        password: "password1",
        role: "scout",
        isAdmin: false,
    });

    await User.register({
        username: "scout2",
        password: "password2",
        role: "scout",
        isAdmin: false,
    });

    const note1 = await Note.create({
        teamNumber: 0,
        eventCode: "USNYLIPORT",
        scoutId: 1,
        noteTitle: "First Round",
        noteText: "Great performance!"
    });
    fakeNoteIds.push(note1.id);

    const note2 = await Note.create({
        teamNumber: 0,
        eventCode: "USNYLIPORT",
        scoutId: 2,
        noteTitle: "Auto Issues",
        noteText: "Needs work on autonomous."
    });
    fakeNoteIds.push(note2.id);
}

async function commonBeforeEach() {
    await db.quesry("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    fakeNoteIds,
};