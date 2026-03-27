const axios = require('axios');


const baseURL = 'https://ftc-api.firstinspires.org/v2.0';


// ----------------------- //
// ------- SEASON -------- //
// ----------------------- //

/**
 * Fetches the current FTC season info based on year from the API.
 * @param {number} year - The year of the season to fetch (e.g., 2025).
 * @returns {Object} An object containing season details like year, name, and key dates.
 */
async function fetchSeasonInfo(year) {
    try {
        const response = await axios.get(
            `${baseURL}/${year}`,
            {
                headers: {
                    'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                }
            }
        );

        const seasonData = response.data;

        return {
            game_name: seasonData.gameName,
            kickoff: seasonData.kickoff,
        };
    } catch (err) {
        console.error("FTC API Error:", err.message);
        throw new Error("Failed to fetch season info from FTC API");
    }
}


// ----------------------- //
// ------- EVENTS -------- //
// ----------------------- //

/**
 * Fetches all event listings for a given season and region code.
 * @param {number} season - e.g., 2026
 * @param {string} regionCode - e.g., 'USNYLI'
 */
async function fetchEventsByRegion(season, regionCode) {
    try {
        const response = await axios.get(
            `${baseURL}/${season}/events`,
            {
                headers: {
                    'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                }
            }
        );

        // Manually filter events by region code since the API doesn't support it directly
        const regionalEvents = response.data.events.filter(event => event.regionCode === regionCode);

        console.log(`Fetched ${regionalEvents.length} events for region ${regionCode} in season ${season}.`);
        console.log("Sample Event Data:", regionalEvents[0]); // Log a sample event for verification
        // Returns the full event objects instead of just codes
        return regionalEvents;
    } catch (error) {
        console.error(`Error fetching events for region ${regionCode}:`, error.message);
        throw new Error("Failed to fetch event listings from FTC API");
    }
}


// ----------------------- //
// ------- TEAMS -------- //
// ----------------------- //

/**
 * Fetch a team by its team number from the FTC API.
 * @param {number} teamNumber - The team number to search for.
 * @returns {Object|null} An object containing team details or null if not found.
 */
async function fetchTeamByNumber(season, teamNumber) {
    const endpoint = `${season}/teams`;

    try {
        const response = await axios.get(
            `${baseURL}/${endpoint}`,
            {
                params: { teamNumber: teamNumber },
                headers: {
                    'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                }
            }
        );

        // The API returns an array of teams, but we expect only one match for a specific team number
        const teamData = response.data.teams[0];

        if (!teamData) return null;

        // Return a clean object to save into your Postgres 'teams' table
        return {
            team_number: teamData.teamNumber,
            team_name: teamData.nameShort || teamData.nameFull,
            rookie_year: teamData.rookieYear
        };
    } catch (err) {

        console.error("FTC API Error:", err.message);
        return null;
    }
}

/** 
 * Fetches all teams by a given region code and season from the FTC API.
 * Handles pagination to retrieve all teams and filters them by region.
 * @param {number} season - e.g., 2025
 * @param {string} regionCode - e.g., 'USNYLI'
 * @returns {Array} An array of team objects with team_number, team_name, and rookie_year.  
 */
async function fetchTeamsByRegion(season, regionCode) {
    try {
        let allTeams = [];
        let page = 1;
        let hasMorePages = true;
        let state = 'NY'; // Example state filter for the region (adjust as needed)

        while (hasMorePages) {
            const response = await axios.get(
                `${baseURL}/${season}/teams`,
                {
                    params: { page: page },
                    headers: {
                        'Authorization': `Basic ${process.env.API_KEY_BASE64}`
                    }
                }
            );

            // Combine teams from the current page
            allTeams = allTeams.concat(response.data.teams);

            // Check if there are more pages
            hasMorePages = response.data.teams.length > 0;
            page++;
        }

        //ALL TEAMS FOR THE SEASON ARE IN ALLTEAMS. Now filter by region code.
        console.log(`Fetched ${allTeams.length} total teams for season ${season}. Now filtering by region ${regionCode}...`);
        console.log("Sample Team Data Before Filtering:", allTeams[490]); // Log a sample team for verification

        //Filter teams by homeRegion (which is the region code) and stateProv (which is the state). This is a bit of a hack since the API doesn't support region filtering directly.
        const filteredTeams = allTeams.filter(team => team.homeRegion === regionCode);

        console.log(`Filtered down to ${filteredTeams.length} teams based on home region ${regionCode} and stateProv = ${state}.`);
        console.log("Sample Team Data After Filtering:", filteredTeams[0]); // Log a sample team for verification
        // Map the filtered teams to the desired format for your database
        return filteredTeams.map(t => ({
            team_number: t.teamNumber,
            team_name: t.nameShort || t.nameFull,
            rookie_year: t.rookieYear
        }));
    } catch (err) {
        console.error("FTC API Error:", err.message);
        throw new Error("Failed to fetch teams from FTC API");
    }
}

/**
 * 
 * @param {*} season 
 * @param {*} eventCode 
 * @returns 
 */
async function fetchTeamsByEvent(season, eventCode) {
    try {
        const response = await axios.get(
            `${baseURL}/${season}/teams?eventCode=${eventCode}`,
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

/**
 * Fetches team stats for a specific team at a specific event and season.
 * @param {number} season - e.g., 2025
 * @param {string} eventCode - e.g., 'NYLI-01'
 * @param {number} teamNumber - e.g., 8818
 * @returns {Object|null} An object containing the team's stats or null if not found.
 */
async function fetchTeamStats(season, eventCode, teamNumber) {
    try {
        const response = await axios.get(
            `${baseURL}/${season}/rankings/${eventCode}`,
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

module.exports = { fetchTeamStats, fetchTeamsByEvent, fetchEventsByRegion, fetchTeamsByRegion, fetchTeamByNumber, fetchSeasonInfo };