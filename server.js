"use strict";
// backend/server.js
require("dotenv").config();

const app = require("./app");
const { PORT } = require("./config");
const debug = require("debug")("ftcns_db");
const startCronJobs = require("./helpers/cron");

// Start cron jobs for periodic tasks (e.g., syncing with FTC API)
startCronJobs();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    debug(`Server is running on port ${PORT}`);
});