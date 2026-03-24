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