"use strick";

/** Express App for FTC Notes Scout */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { NotFoundError } = require("./expressError");

const app = express();

app.use(cors()); // allow cross-origin requests (for frontend)
app.use(express.json()); // parse incoming requests with JSON payloads (for API clients)
app.use(morgan("tiny")); // logging system

// TODO: add app.use() for routes here

/** --- Routes ---- */
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const noteRoutes = require("./routes/notes");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);


// Basic route for testing
app.get("/", function (req, res) {
    return res.json({ message: "Welcome to the FTC Note Scout API!" });
});

/** Handle 404 errors -- this matches everything */

/** Generic error handler */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;

