/**
 * Cron job helper functions for scheduling tasks in the backend.
 */

const cron = require('node-cron');
const Event = require('../models/event');
const Team = require('../models/team');
const { fetchEventsByRegion, fetchTeamsByRegion } = require('./ftcAPI');

/**
 * TASK 1: Weekly Regional Sync
 * Refreshes all Event and Team data for the specified region.
 */
async function runWeeklyRegionalSync() {
    const region = 'USNYLI';
    const season = 2026;

    console.log(`---Starting Weekly Sync for Region: ${region} ---`);

    try {
        // 1. Sync Events
        const apiEvents = await fetchEventsByRegion(season, region);

        if (apiEvents && apiEvents.length > 0) {
            await Event.syncEvents(apiEvents, region);
            console.log(`Events Synced: ${apiEvents.length} tournaments found.`);
        } else {
            console.warn("No events found in API response. Skipping event sync.");
        }

        // 2. Sync Teams
        const apiTeams = await fetchTeamsByRegion(season, region);

        if (apiTeams && apiTeams.length > 0) {
            await Team.syncTeams(apiTeams);
            console.log(`Teams Synced: ${apiTeams.length} teams found.`);
        } else {
            console.warn("No teams found in API response. Skipping team sync.");
        }

        console.log("--- Weekly Regional Sync Complete ---");
    } catch (err) {
        // This catch block now handles actual API failures (404, 500, etc.)
        console.error("--- Weekly Sync ABORTED due to error ---");
        console.error(`Reason: ${err.message}`);
    }
}

/**
 * MAIN REGISTRY
 */
function startCronJobs() {
    console.log("Cron Service Initialized...");

    // Schedule: Every Sunday at 00:00 (Midnight)
    // Pattern: [Minute] [Hour] [Day of Month] [Month] [Day of Week]
    cron.schedule('0 0 * * 0', runWeeklyRegionalSync);

    // For Testing immediately run the sync when 
    //  the server restarts during development.
    // runWeeklyRegionalSync(); 
}

module.exports = startCronJobs;