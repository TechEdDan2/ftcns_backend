"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJwt,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /events", () => {
    test("works for authenticated users", async () => {
        const resp = await request(app)
            .get("/events")
            .set("Authorization", `Bearer ${testJwt}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.events).toBeInstanceOf(Array);
        expect(resp.body.events.length).toBeGreaterThan(0);
    });
});

describe("GET /events/:event_code", () => {
    test("works for authenticated users", async () => {
        const resp = await request(app)
            .get("/events/USNYLIPORT2")
            .set("Authorization", `Bearer ${testJwt}`); // Replace with a valid test JWT
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.event).toHaveProperty("event_code", "USNYLIPORT2");
    });

    test("not found for invalid event_code", async () => {
        const resp = await request(app)
            .get("/events/INVALID_CODE")
            .set("Authorization", `Bearer ${testJwt}`); // Replace with a valid test JWT
        expect(resp.statusCode).toEqual(404);
    });
});

describe("GET /events/name/:event_name", () => {
    test("works for authenticated users", async () => {
        const resp = await request(app)
            .get("/events/name/New%20York%20City%20Regional")
            .set("Authorization", `Bearer ${testJwt}`); // Replace with a valid test JWT
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.event).toHaveProperty("event_name", "New York City Regional");
    });

    test("not found for invalid event_name", async () => {
        const resp = await request(app)
            .get("/events/name/INVALID_NAME")
            .set("Authorization", `Bearer ${testJwt}`); // Replace with a valid test JWT
        expect(resp.statusCode).toEqual(404);
    });
});

