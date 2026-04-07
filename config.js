"use strict";

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not set. Please configure it in the environment.");
}

const PORT = +process.env.PORT || 3001;

// 
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "postgresql:///ftcns_db_test"
        : (process.env.DATABASE_URL || "postgresql:///ftcns_db");
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri
};