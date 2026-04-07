"use strict";

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const connectionString = getDatabaseUri();

// Create the config object
const dbConfig = {
    connectionString: connectionString,
};

// If we are on Render OR the URL points to a cloud database (contains 'render' or 'aws')
// we MUST use SSL.
if (process.env.NODE_ENV === "production" || connectionString.includes("render.com")) {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

const db = new Client(dbConfig);

db.connect()
    .then(() => console.log("Connected to PostgreSQL successfully!"))
    .catch(err => console.error("Connection error:", err.stack));

module.exports = db;