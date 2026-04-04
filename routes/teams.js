"use strict";

/** Routes for teams. */
const jsonschema = require("jsonschema");
const express = require('express');

const { BadRequestError } = require("../expressError");
const { authenticateJWT, ensureRole } = require("../middleware/auth");

const Team = require("../models/team");



const router = express.Router();

// Mock database - replace with actual database calls
let teams = [];

// POST create new team
router.post('/', ensureRole('admin'), async (req, res, next) => {
    try {
        const { team_number, team_name, rookie_year } = req.body;
        const newTeam = await Team.create({ team_number, team_name, rookie_year });
        return res.status(201).json(newTeam);
    } catch (err) {
        console.error("Error creating team:", err); // Added error logging
        if (err instanceof BadRequestError) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to create team' });
        }
    }
});

// GET all teams
router.get('/', authenticateJWT, async (req, res, next) => {
    try {
        const allTeams = await Team.findAll(); // Fixed method name
        return res.json(allTeams);
    } catch (err) {
        console.error("Error retrieving teams:", err); // Added error logging
        res.status(500).json({ error: 'Failed to retrieve teams' });
    }
});


// GET team by number
router.get('/:team_number', authenticateJWT, async (req, res, next) => {
    try {
        const team = await Team.findByTeam(req.params.team_number); // Fixed method name
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        return res.json(team);
    } catch (err) {
        console.error(`Error retrieving team ${req.params.team_number}:`, err); // Added error logging
        res.status(500).json({ error: 'Failed to retrieve team' });
    }

});

// GET teams by filter criteria
router.get('/filter', authenticateJWT, async (req, res, next) => {
    try {
        const filterObj = req.query;

        console.log("Incoming query:", req.query);

        const filteredTeams = await Team.findByFilter(filterObj);
        console.log("Constructed filter object:", filterObj);
        console.log("Filtered teams result:", filteredTeams);

        return res.json({ teams: filteredTeams });
    } catch (err) {
        return next(err);
    }
});
// GET teams by filter criteria v2
// router.get('/filter', authenticateJWT, async (req, res, next) => {
//     try {
//         const { term, type } = req.query;

//         // Validate the search type
//         if (!type || !['teams', 'notes'].includes(type)) {
//             throw new BadRequestError(`Invalid search type: ${type}`);
//         }

//         // Validate the search term
//         if (!term || typeof term !== 'string' || !term.trim()) {
//             throw new BadRequestError(`Invalid search term: ${term}`);
//         }

//         let filterObj = {};
//         if (type === 'teams') {
//             // If searching for teams, ensure the term is numeric
//             if (isNaN(term)) {
//                 throw new BadRequestError(`Invalid team number: ${term}`);
//             }
//             filterObj.teamNumberLike = parseInt(term, 10);
//         } else if (type === 'notes') {
//             // If searching for notes, use the term as a text filter
//             filterObj.nameLike = term;
//         }

//         console.log("Incoming query:", req.query);
//         console.log("Constructed filter object:", filterObj);

//         const filteredTeams = await Team.findByFilter(filterObj);
//         return res.json({ teams: filteredTeams });
//     } catch (err) {
//         return next(err);
//     }
// });

// PATCH update team
router.patch('/:team_number', ensureRole('admin'), async (req, res, next) => {
    try {
        const { team_name, rookie_year } = req.body;
        const updatedTeam = await Team.update(req.params.team_number, { team_name, rookie_year });
        if (!updatedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }
        return res.json(updatedTeam);
    } catch (err) {
        console.error(`Error updating team ${req.params.team_number}:`, err); // Added error logging
        if (err instanceof BadRequestError) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Failed to update team' });
        }
    }

});

// DELETE team
router.delete('/:team_number', ensureRole('admin'), async (req, res) => {
    try {
        const deletedTeam = await Team.remove(req.params.team_number);
        if (!deletedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }
        return res.json({ message: 'Team deleted successfully' });
    } catch (err) {
        console.error(`Error deleting team ${req.params.team_number}:`, err); // Added error logging
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

module.exports = router;