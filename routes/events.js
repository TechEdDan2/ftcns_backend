"use strict";

/** Routes for Events */
const jsonschema = require("jsonschema");
const express = require('express');

const { BadRequestError } = require("../expressError");
const { ensureRole, ensureAdminOrSelf, authenticateJWT } = require("../middleware/auth");

// Models
const Event = require("../models/event");

// Router object- create new router for events routes
const router = express.Router();

// GET /events - get all events
router.get('/', authenticateJWT, async (req, res, next) => {
    try {
        const events = await Event.getAll();
        return res.json({ events });
    } catch (err) {
        return next(err);
    }
});

// GET /events/:event_code - get event by code
router.get('/:event_code', authenticateJWT, async (req, res, next) => {
    try {
        const event = await Event.getByCode(req.params.event_code);
        return res.json({ event });
    } catch (err) {
        return next(err);
    }
});

// GET /events/:event_name - get event by name
router.get('/name/:event_name', authenticateJWT, async (req, res, next) => {
    try {
        const event = await Event.getByName(req.params.event_name);
        return res.json({ event });
    } catch (err) {
        return next(err);
    }
});

// GET /events/date-range?start=YYYY-MM-DD&end=YYYY-MM-DD - get events within a date range
router.get('/date-range', authenticateJWT, async (req, res, next) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            throw new BadRequestError("Start and end dates are required in the format YYYY-MM-DD");
        }
        const events = await Event.getEventsByDateRange(start, end);
        return res.json({ events });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;