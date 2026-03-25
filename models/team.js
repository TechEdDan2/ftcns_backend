"use strict";

/** Models for teams. */
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");


/** Related functions for teams. */

class Team {
    /** 
     * Syncs teams from the FTC API into the local database.
     * Uses UPSERT logic to handle existing teams.
     * @param {Array} apiTeams - An array of team objects fetched from the FTC API for a specific region.
     * @returns {Object} An object containing the count of teams processed.
     * 
     */
    static async syncTeams(apiTeams) {
        for (let t of apiTeams) {
            await db.query(
                `INSERT INTO teams (team_number, team_name, rookie_year)
             VALUES ($1, $2, $3)
             ON CONFLICT (team_number) 
             DO UPDATE SET 
                team_name = EXCLUDED.team_name,
                rookie_year = EXCLUDED.rookie_year`,
                [t.team_number, t.team_name, t.rookie_year]
            );
        }
        return { count: apiTeams.length };
    }

    /** Create a team (from data), update db, return new team data.
     *
     * data should be { team_number, team_name, rookie_year }
     *
     * Returns { team_number, team_name, rookie_year }
     *
     * Throws BadRequestError if team already in database.
     * 
     * @param {team_number, team_name, rookie_year} data - The team data to create.
     * @return {Object} The newly created team data.
     * @throws {BadRequestError} If a team with the same team_number already exists.
     * */

    static async create({ team_number, team_name, rookie_year }) {
        const duplicateCheck = await db.query(
            `SELECT team_number
             FROM teams
             WHERE team_number = $1`,
            [team_number],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate team number: ${team_number}`);
        }

        const result = await db.query(
            `INSERT INTO teams
             (team_number, team_name, rookie_year)
                VALUES ($1, $2, $3)
                RETURNING team_number, team_name, rookie_year`,
            [team_number, team_name, rookie_year],
        );
        const team = result.rows[0];

        return team;
    }

    /** Find all teams.
     *
     * Returns [{ team_number, team_name, rookie_year }, ...]
     * */

    static async findAll() {
        const result = await db.query(
            `SELECT team_number,
                    team_name,
                    rookie_year
             FROM teams
             ORDER BY team_number`,
        );
        return result.rows;
    }

    /** Given a team number, return data about team.
     *
     * Returns { team_number, team_name, rookie_year }
     *
     * Throws NotFoundError if not found.
     *
     * @param {number} team_number - The team number to search for.
     * @return {Object} The team data for the specified team number.
     * @throws {NotFoundError} If no team with the given team number is found.
     */

    static async findByTeam(team_number) {
        const result = await db.query(
            `SELECT team_number,
                    team_name,
                    rookie_year
             FROM teams
             WHERE team_number = $1`,
            [team_number],
        );

        const team = result.rows[0];

        if (!team) throw new NotFoundError(`No team: ${team_number}`);

        return team;
    }

    /** Update team data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { team_name, rookie_year }
     *
     * Returns { team_number, team_name, rookie_year }
     *
     * Throws NotFoundError if not found.
     *
     * @param {number} team_number - The team number of the team to update.
     * @param {Object} data - The data to update (can include team_name and/or rookie_year).
     * @return {Object} The updated team data.
     * @throws {NotFoundError} If no team with the given team number is found.
     */

    static async update(team_number, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                teamName: "team_name",
                rookieYear: "rookie_year"
            });
        const teamNumberVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE teams 
                          SET ${setCols} 
                          WHERE team_number = ${teamNumberVarIdx} 
                          RETURNING team_number, team_name, rookie_year`;
        const result = await db.query(querySql, [...values, team_number]);
        const team = result.rows[0];

        if (!team) throw new NotFoundError(`No team: ${team_number}`);

        return team;
    }

    /** Delete given team from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     *
     * @param {number} team_number - The team number of the team to delete.     
     * @return {undefined}
     * @throws {NotFoundError} If no team with the given team number is found.
     */

    static async remove(team_number) {
        const result = await db.query(
            `DELETE
             FROM teams
             WHERE team_number = $1
             RETURNING team_number`,
            [team_number],
        );
        const team = result.rows[0];

        if (!team) throw new NotFoundError(`No team: ${team_number}`);
    }
}

module.exports = Team;