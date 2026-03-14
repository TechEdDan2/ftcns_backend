"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for notes. */

class Note {
    /**
     * Create a new note with the provided data.
     *
     * This method inserts a new note into the database with the given title, content, team number, and author username.
     *
     * Returns an object containing:
     *  { id, teamNumber, eventCode, scoutId, noteTitle, noteText, createdAt }
     * 
     * Throws a `BadRequestError` if the note cannot be created due to missing or invalid data.
     *
     * @param {Object} noteData - The data for the new note.
     * @param {number} noteData.teamNumber - The team number associated with the note.
     * @param {string} noteData.eventCode - The event code associated with the note.
     * @param {string} noteData.scoutUsername - The username of the scout creating the note.
     * @param {string} noteData.noteTitle - The title of the note.
     * @param {string} noteData.noteText - The content of the note.
     * @returns {Object} The newly created note's details.
     * @throws {BadRequestError} If the note cannot be created.
     */

    // Helper method to validate note data before creation
    static _validateNoteData({ teamNumber, eventCode, scoutUsername, noteTitle, noteText }) {
        if (!teamNumber || typeof teamNumber !== "number") {
            throw new BadRequestError("Invalid or missing team number.");
        }
        if (!eventCode || typeof eventCode !== "string" || eventCode.trim() === "") {
            throw new BadRequestError("Invalid or missing event code.");
        }
        if (!scoutUsername || typeof scoutUsername !== "string" || scoutUsername.trim() === "") {
            throw new BadRequestError("Invalid or missing scout username.");
        }
        if (!noteTitle || typeof noteTitle !== "string" || noteTitle.trim() === "") {
            throw new BadRequestError("Invalid or missing note title.");
        }
        if (!noteText || typeof noteText !== "string" || noteText.trim() === "") {
            throw new BadRequestError("Invalid or missing note text.");
        }
    }

    static async create({ teamNumber, eventCode, scoutUsername, noteTitle, noteText }) {
        // Validate input data
        this._validateNoteData({ teamNumber, eventCode, scoutUsername, noteTitle, noteText });

        // Get scout ID from username
        const scoutResult = await db.query(
            `SELECT id FROM users WHERE username = $1`,
            [scoutUsername]
        );

        const scout = scoutResult.rows[0];
        if (!scout) {
            throw new BadRequestError(`No user found with username: ${scoutUsername}`);
        }

        const scoutId = scout.id;

        // Insert the new note into the database
        const result = await db.query(
            `INSERT INTO notes (team_number, event_code, scout_id, note_title, note_text)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, 
                team_number AS "teamNumber", event_code AS "eventCode", scout_id AS "scoutId", 
                note_title AS "noteTitle", note_text AS "noteText", created_at AS "createdAt"`,
            [teamNumber, eventCode, scoutId, noteTitle, noteText]
        );

        const note = result.rows[0];
        return note;
    }

    /**
     * The `findAll` method retrieves all notes from the database, ordered by creation date in descending order.
     *
     * Returns an array of note objects, each containing:
     *  { id, teamNumber, eventCode, scoutId, noteTitle, noteText, createdAt }  
     * 
     * @returns {Array} An array of all notes in the database.
     */
    static async findAll() {
        const result = await db.query(
            `SELECT id, 
                team_number AS "teamNumber", event_code AS "eventCode", scout_id AS "scoutId", 
                note_title AS "noteTitle", note_text AS "noteText", created_at AS "createdAt"
             FROM notes
             ORDER BY created_at DESC`
        );

        return result.rows;
    }

    /** 
     * Find all notes by team number  
     * 
     * This method retrieves all notes associated with a specific team number, regardless of the event.
     * 
     * Returns an array of note objects, each containing:
     *  { id, teamNumber, eventCode, scoutId, noteTitle, noteText, createdAt }  
     * 
     * @param {number} teamNumber - The team number to filter notes by.
     * @returns {Array} An array of notes matching the team number.
     */

    static async findByTeam(teamNumber) {
        const result = await db.query(
            `SELECT id, 
                team_number AS "teamNumber", event_code AS "eventCode", scout_id AS "scoutId", 
                note_title AS "noteTitle", note_text AS "noteText", created_at AS "createdAt"
             FROM notes
             WHERE team_number = $1
             ORDER BY created_at DESC`,
            [teamNumber]
        );

        const teamNotes = result.rows;
        return teamNotes;
    }


    /**
     * Find all notes for a given team and event.
     *
     * This method retrieves all notes associated with a specific team number and event code.
     *
     * Returns an array of note objects, each containing:
     *  { id, teamNumber, eventCode, scoutId, noteTitle, noteText, createdAt }
     * 
     * Throws a `NotFoundError` if no notes are found for the specified team and event.
     *
     * @param {number} teamNumber - The team number to filter notes by.
     * @param {string} eventCode - The event code to filter notes by.
     * @returns {Array} An array of notes matching the criteria.
     * @throws {NotFoundError} If no notes are found for the specified team and event.  
     * 
     */

    static async findByTeamAndEvent(teamNumber, eventCode) {
        const result = await db.query(
            `SELECT id, 
                team_number AS "teamNumber", event_code AS "eventCode", scout_id AS "scoutId", 
                note_title AS "noteTitle", note_text AS "noteText", created_at AS "createdAt"
             FROM notes
             WHERE team_number = $1 AND event_code = $2
             ORDER BY created_at DESC`,
            [teamNumber, eventCode]
        );

        const notes = result.rows;

        if (notes.length === 0) {
            throw new NotFoundError(`No notes found for team ${teamNumber} at event ${eventCode}.`);
        }

        return notes;
    }

    /** 
     * Find a note by a specific filter team number, event code, and scout username
     * 
     * This method retrieves a single note that matches the provided team number, event code, and scout username.
     */
    static async findByFilter(filters) {
        if (Object.keys(filters).length === 0) {
            return this.findAll();
        }

        //Build the Query
        let qString = `SELECT n.id, 
                            n.team_number AS "teamNumber", 
                            n.event_code AS "eventCode", 
                            n.scout_id AS "scoutId", 
                            n.note_title AS "noteTitle", 
                            n.note_text AS "noteText", 
                            n.created_at AS "createdAt"
                    FROM notes n
                    JOIN users u ON n.scout_id = u.id`;

        const where = [];
        const values = [];

        if (filters.teamNumber !== undefined) {
            values.push(filters.teamNumber);
            where.push(`n.team_number = $${values.length}`);
        }

        if (filters.eventCode !== undefined) {
            values.push(filters.eventCode);
            where.push(`n.event_code = $${values.length}`);
        }

        if (filters.scoutUsername !== undefined) {
            values.push(filters.scoutUsername);
            where.push(`u.username = $${values.length}`);
        }

        if (where.length > 0) {
            qString += " WHERE " + where.join(" AND ");
        }

        qString += " ORDER BY n.created_at DESC";

        const result = await db.query(qString, values);
        const filteredNotes = result.rows;

        if (filteredNotes.length === 0) {
            return [];
        }

        return filteredNotes;
    }

    /** 
     * Get a note by its ID
     * 
     * This method retrieves a single note based on its unique ID.
     * 
     * Returns an object containing:
     *  { id, teamNumber, eventCode, scoutId, noteTitle, noteText, createdAt }
     * 
     * Throws a `NotFoundError` if no note is found with the specified ID.
     * 
     * @param {number} id - The unique ID of the note to retrieve.
     * @returns {Object} The details of the note with the specified ID.
     * @throws {NotFoundError} If no note is found with the specified ID.   
     */

    static async get(id) {
        const result = await db.query(
            `SELECT id, 
                team_number AS "teamNumber", event_code AS "eventCode", scout_id AS "scoutId", 
                note_title AS "noteTitle", note_text AS "noteText", created_at AS "createdAt"
             FROM notes
             WHERE id = $1`,
            [id]
        );

        const note = result.rows[0];

        if (!note) {
            throw new NotFoundError(`No note found with ID: ${id}`);
        }

        return note;
    }

    /**
     * Update a note's title and text by its ID
     * 
     * This method allows updating the title and text of a note based on its unique ID.
     * 
     * Returns an object containing:
     *  { id, teamNumber, eventCode, scoutId, noteTitle, noteText, createdAt }
     * 
     * Throws a `NotFoundError` if no note is found with the specified ID.
     * 
     * @param {number} id - The unique ID of the note to update.
     * @param {Object} data - An object containing the new title and text for the note.
     * @param {string} data.noteTitle - The new title for the note.
     * @param {string} data.noteText - The new text for the note.
     * @returns {Object} The updated details of the note.
     * @throws {NotFoundError} If no note is found with the specified ID.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                noteTitle: "note_title",
                noteText: "note_text",
            }
        );

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE notes 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, 
                                team_number AS "teamNumber", 
                                event_code AS "eventCode", scout_id AS "scoutId", note_title AS "noteTitle", note_text AS "noteText", created_at AS "createdAt"`;
        const result = await db.query(querySql, [...values, id]);
        const note = result.rows[0];

        if (!note) {
            throw new NotFoundError(`No note found with ID: ${id}`);
        }

        return note;
    }

    /** 
     * Delete a note by its ID
     * 
     * This method removes a note from the database based on its unique ID.
     * 
     * Throws a `NotFoundError` if no note is found with the specified ID.
     * 
     * @param {number} id - The unique ID of the note to delete.
     * @returns {number} The ID of the deleted note.
     * @throws {NotFoundError} If no note is found with the specified ID.   
     */

    static async remove(id) {
        const result = await db.query(
            `DELETE FROM notes
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        const note = result.rows[0];

        if (!note) {
            throw new NotFoundError(`No note found with ID: ${id}`);
        }

        return { deleted: id };
    }
}

module.exports = Note;