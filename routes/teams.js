"use strict";

/** Routes for teams. */
const jsonschema = require("jsonschema");
const express = require('express');

const { BadRequestError } = require("../expressError");
const Team = require("../models/team");
const teamNewSchema = require("../schemas/teamNew.json");
const teamUpdateSchema = require("../schemas/teamUpdate.json");


const router = express.Router();

// Mock database - replace with actual database calls
let teams = [];

// GET all teams
router.get('/', (req, res) => {
    res.json(teams);
});

// GET team by number
router.get('/:team_number', (req, res) => {
    const team = teams.find(t => t.team_number === parseInt(req.params.team_number));
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
});

// POST create new team
router.post('/', (req, res) => {
    const { team_number, team_name, rookie_year } = req.body;

    if (!team_number || !team_name) {
        return res.status(400).json({ error: 'team_number and team_name are required' });
    }

    const newTeam = { team_number, team_name, rookie_year };
    teams.push(newTeam);
    res.status(201).json(newTeam);
});

// PATCH update team
router.patch('/:team_number', (req, res) => {
    const team = teams.find(t => t.team_number === parseInt(req.params.team_number));
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (req.body.team_name) team.team_name = req.body.team_name;
    if (req.body.rookie_year !== undefined) team.rookie_year = req.body.rookie_year;

    res.json(team);
});

// DELETE team
router.delete('/:team_number', (req, res) => {
    const index = teams.findIndex(t => t.team_number === parseInt(req.params.team_number));
    if (index === -1) return res.status(404).json({ error: 'Team not found' });

    const deletedTeam = teams.splice(index, 1);
    res.json(deletedTeam[0]);
});

module.exports = router;