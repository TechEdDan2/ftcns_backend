// bin/bootstrapTeams.js
require('dotenv').config();
const db = require('../db');
const { fetchTeamsByEvent } = require('../helpers/ftcAPI');

async function run() {
    console.log("Fetching teams from FTC API...");
    const teams = await fetchTeamsByEvent(2026, 'USNYLIFPQ1'); // Example Event Code

    for (let team of teams) {
        await db.query(
            `INSERT INTO teams (team_number, team_name, rookie_year)
             VALUES ($1, $2, $3)
             ON CONFLICT (team_number) 
             DO UPDATE SET team_name = EXCLUDED.team_name`,
            [team.team_number, team.team_name, team.rookie_year]
        );
    }
    console.log(`Successfully synced ${teams.length} teams.`);
    process.exit();
}

run();