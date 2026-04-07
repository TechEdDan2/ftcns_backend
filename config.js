"use strict";

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not set. Please configure it in the environment.");
}

const PORT = +process.env.PORT || 3001;

// Determine if we are running on Render/Production
const isProduction = process.env.NODE_ENV === "production";

function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "postgresql:///ftcns_db_test"
        : (process.env.DATABASE_URL || "postgresql:///ftcns_db");
}

/** * Returns SSL configuration for pg Client.
 * On Render (production), we must use SSL with rejectUnauthorized: false.
 */
function getSslConfig() {
    return isProduction
        ? { rejectUnauthorized: false }
        : false;
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri, // Make sure this is here
    getSslConfig    // Added this export
};