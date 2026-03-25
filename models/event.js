"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** 
 * The Event class 
 * 
 */
class Event {

    /**  
     * Syncs events from the FTC API into the local database.
     * Uses UPSERT logic (INSERT ... ON CONFLICT) to ensure it doesn't 
     * create duplicate events if the cron job runs multiple times.
     * 
     * @param {Array} apiEvents - An array of event objects fetched from the FTC API for a specific region.
     * @param {String} regionCode - The region code associated with the events (e.g., "NE", "SE", "NC", etc.)
     * @returns {Object} An object containing the count of events processed.
     */
    static async syncEvents(apiEvents, regionCode) {
        for (let e of apiEvents) {
            await db.query(
                `INSERT INTO events (
                    event_code, 
                    region_code, 
                    event_name, 
                    event_date, 
                    city, 
                    state_prov
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (event_code) 
                DO UPDATE SET 
                    event_name = EXCLUDED.event_name,
                    event_date = EXCLUDED.event_date,
                    city = EXCLUDED.city,
                    state_prov = EXCLUDED.state_prov`,
                [
                    e.code,        // Mapping API 'code' to 'event_code'
                    regionCode,
                    e.name,        // Mapping API 'name' to 'event_name'
                    e.dateStart,   // Mapping API 'dateStart' to 'event_date'
                    e.city,
                    e.stateProv    // Mapping API 'stateProv' to 'state_prov'
                ]
            );
        }
        return { count: apiEvents.length };
    }

    /**
     * The getAll method retrieves all events from the database, ordered by date (newest first).
     * @returns {Array} An array of event objects, each containing event_code, region_code, event_name, event_date, city, state_prov, and is_active. 
     */
    static async getAll() {
        const result = await db.query(
            `SELECT event_code, 
                region_code, 
                event_name, 
                event_date, 
                city, 
                state_prov, 
                is_active
             FROM events
             ORDER BY event_date DESC`
        );
        return result.rows;
    }

    static async getByCode(event_code) {
        const result = await db.query(
            `SELECT event_code, 
                region_code, 
                event_name, 
                event_date, 
                city, 
                state_prov, 
                is_active
             FROM events
             WHERE event_code = $1`,
            [event_code]
        );


        const event = result.rows[0];
        if (!event) throw new NotFoundError(`No event found with code: ${event_code}`);
        return event;
    }

    static async getByName(eventName) {
        const result = await db.query(
            `SELECT * FROM events WHERE event_name = $1`,
            [eventName]
        );

        const event = result.rows[0];
        if (!event) throw new NotFoundError(`No event found with name: ${eventName}`);
        return event;
    }

    static async getEventsByDateRange(startDate, endDate) {
        const result = await db.query(
            `SELECT event_code, 
                region_code, 
                event_name, 
                event_date, 
                city, 
                state_prov, 
                is_active
             FROM events
             WHERE event_date BETWEEN $1 AND $2
             ORDER BY event_date DESC`,
            [startDate, endDate]
        );
        return result.rows;
    }

    static async getActiveEvents() {
        const result = await db.query(
            `SELECT event_code, 
                region_code, 
                event_name, 
                event_date, 
                city, 
                state_prov, 
                is_active
             FROM events
             WHERE is_active = true
             ORDER BY event_date DESC`
        );
        return result.rows;
    }

}

module.exports = Event;