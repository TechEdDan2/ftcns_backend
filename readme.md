# Jobly Backend

- [Overview](#overview)
  - [Features](#features)
  - [Future Improvements](#future-improvements)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Setup Instructions](#setup-instructions)
- [Routes](#routes)
- [Author](#author)
- [Acknowledgments](#acknowledgments)
- [License] (#license)

## Overview
This is the backend for the FTC Note Scout app (FTCNS), a web application that allows users to create and manage notes about FIRST Tech Challenge teams during Season events. The backend is built with Node.js and Express, and it uses PostgreSQL for data storage. The API provides endpoints for creating, retrieving, updating, and deleting notes. 

For this first version of the app, the backend focuses on core note management features and user authentication. It is also focused on the USNYLI region. Future versions will include more advanced features such as team and event data integration, analytics, and enhanced user profiles.

### Features
- User Authentication: Users can register and log in to the app securely using JWT tokens.
- Secure Password Storage: User passwords are hashed using bcrypt before being stored in the database.
- CRUD Operations: Users can create, read, update, and delete their notes about FTC teams.
- Data Validation: Input data is validated to ensure data integrity and security.

### Future Improvements
- Team and Event Data Integration: Integrate data from the FTC API during live events to provide users with up-to-date information about teams and matches.

## Built With
- Node.js
- Express
- PostgreSQL
- pg (node-postgres)
- Jest (for testing)
- Supertest (for testing)
- dotenv (for environment variable management)
- bcrypt (for password hashing)
- jsonwebtoken (for authentication)
- morgan (for logging)
- cors (for handling Cross-Origin Resource Sharing)
- axios (for making HTTP requests to the FTC API)
- node-cron (for scheduling tasks)

## Getting Started

### Setup Instructions

## Routes
- `POST /auth/register`: Register a new user.
- `POST /auth/token`: Log in an existing user and receive a JWT token.
- `POST /notes`: Create a new note (requires authentication).
- `GET /notes`: Retrieve all notes for the authenticated user.
- `GET /notes/:id`: Retrieve a specific note by ID (requires authentication).
- `GET /notes/team/:team_number`: Retrieve all notes for a specific team number (requires authentication).
- `PATCH /notes/:id`: Update a specific note by ID (requires authentication).
- `DELETE /notes/:id`: Delete a specific note by ID (requires authentication).
- Other routes for fetching teams and events from the FTC API are also available in the `ftcAPI.js` helper module, but they are not exposed as public API endpoints in this version of the backend.

---

## Author
- Github - [TechEdDan2](https://github.com/TechEdDan2)
- Frontend Mentor - [@TechEdDan2](https://www.frontendmentor.io/profile/TechEdDan2)

## Acknowledgments
The YouTubers and other educational resources I have been learning from include: Coder Coder (Jessica Chan), BringYourOwnLaptop (Daniel Walter Scott), Kevin Powell, Dipesh Malvia (Scheduling Tasks - Cron Jobs), vairous Udemy courses, Geeks for Geeks, Stack Overflow, and Stony Brook University's Software Engineering Bootcamp (curriculum developed by Colt Steele) 

## License
This project is licensed under the ISC license