const axios = require('axios');

/**
 * Fetches all event listings for a given season and region code.
 * @param {number} season - e.g., 2026
 * @param {string} regionCode - e.g., 'USNYLI'
 */
async function fetchEventsByRegion(season, regionCode) {
    try {
        const response = await axios.get(
            `https://ftc-events.firstinspires.org/v2.0/${season}/events`,
            {
                params: { regionCode: regionCode },
                headers: {
                    'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                }
            }
        );

        // Map the results to return just the Event Codes (IDs)
        return response.data.events.map(event => event.eventCode);
    } catch (error) {
        console.error(`Error fetching events for region ${regionCode}:`, error.message);
        throw new Error("Failed to fetch event listings from FTC API");
    }
}


async function fetchTeamsByEvent(season, eventCode) {
    try {
        const response = await axios.get(
            `https://ftc-events.firstinspires.org/v2.0/${season}/teams?eventCode=${eventCode}`,
            {
                headers: {
                    'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                }
            }
        );

        // The API returns { teams: [...], teamCount: X }
        return response.data.teams.map(t => ({
            team_number: t.teamNumber,
            team_name: t.nameShort || t.nameFull,
            rookie_year: t.rookieYear
        }));
    } catch (err) {
        console.error("FTC API Error:", err.message);
        return [];
    }
}

async function fetchTeamStats(season, eventCode, teamNumber) {
    try {
        const response = await axios.get(
            `https://ftc-events.firstinspires.org/v2.0/${season}/rankings/${eventCode}`,
            {
                headers: {
                    'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                }
            }
        );

        // Find the specific team in the returned rankings array
        const teamStats = response.data.rankings.find(
            (t) => t.teamNumber === parseInt(teamNumber)
        );

        if (!teamStats) return null;

        // Return a clean object to save into your Postgres 'teams' table
        return {
            team_number: teamStats.teamNumber,
            season_rank: teamStats.rank,
            wins: teamStats.wins,
            losses: teamStats.losses,
            ties: teamStats.ties,
            ranking_points: teamStats.rankingPoints
        };
    } catch (error) {
        console.error("Error fetching FTC stats:", error);
        throw new Error("Failed to fetch team stats from FTC API");
    }
}



module.exports = { fetchTeamStats, fetchTeamsByEvent, fetchEventsByRegion };