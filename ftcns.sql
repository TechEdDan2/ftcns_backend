\set ON_ERROR_STOP on

DROP DATABASE IF EXISTS ftcns_db;
CREATE DATABASE ftcns_db;
\connect ftcns_db;

\echo "Creating schema for ftcns_db..."
\i ftcns-schema.sql
\echo "Schema created successfully for ftcns_db."
\echo "Seeding data for ftcns_db..."
\i ftcns-seed.sql
\echo "Data seeded successfully for ftcns_db."

DROP DATABASE IF EXISTS ftcns_db_test;
CREATE DATABASE ftcns_db_test;
\connect ftcns_db_test;

\echo "Creating schema for ftcns_db_test..."
\i ftcns-schema.sql
\echo "Schema created successfully for ftcns_db_test."
\echo "Seeding data for ftcns_db_test..."
\i ftcns-seed.sql
\echo "Data seeded successfully for ftcns_db_test."

