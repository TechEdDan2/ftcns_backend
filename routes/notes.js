"use strict";

/** Routes for Notes */
const jsonschema = require("jsonschema");
const express = require('express');

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureRole, ensureAdminOrSelf } = require("../middleware/auth");

const Note = require("../models/note");
const noteNewSchema = require("../schemas/noteNew.json");
const noteUpdateSchema = require("../schemas/noteUpdate.json");

const router = express.Router();

// GET /notes - get all notes
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const notes = await Note.findAll();
        return res.json({ notes });
    } catch (err) {
        return next(err);
    }
});

// GET /notes/:id - get note by id
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            throw new NotFoundError(`No note with id: ${req.params.id}`);
        }
        return res.json({ note });
    } catch (err) {
        return next(err);
    }
});

// GET /notes/team/:team_number - get all notes for a team
router.get('/team/:team_number', ensureLoggedIn, async (req, res, next) => {
    try {
        const notes = await Note.findByTeam(req.params.team_number);
        return res.json({ notes });
    } catch (err) {
        return next(err);
    }
});

// POST /notes - create a new note
router.post('/', ensureAdminOrSelf, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, noteNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const note = await Note.create(req.body);
        return res.status(201).json({ note });
    } catch (err) {
        return next(err);
    }
});

// PATCH /notes/:id - update a note by id only by the author or an admin
router.patch('/:id', ensureAdminOrSelf, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, noteUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const note = await Note.update(req.params.id, req.body);
        return res.json({ note });
    } catch (err) {
        return next(err);
    }
});

// DELETE /notes/:id - delete a note by id only by the author or an admin
router.delete('/:id', ensureAdminOrSelf, async (req, res, next) => {
    try {
        await Note.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;