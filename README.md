## Messagely
Messagely is a simple JavaScript web application designed for simple messaging between users. It was primarily used to facilitate learning of password hashing.

To run Messagely successfully, an .env file **must** be configured:

    DB_USER="psql"
    DB_PASSWORD="abc123"
    NODE_ENV="production"
    SECRET_KEY="secret"
    
## Seeding
To create the databases and schema for production and development, run `psql -f data.sql`.
To create the test database, run `psql -f data_test.sql`.
    
## Testing

 - To run tests, run `jest [name of test suite]`. Test suites will **not** run successfully if run concurrently (i.e simply running `jest`.
 - The tests are located under "_ _tests _ _".
	 - authRoutes.test.js
	 - messages.test.js
	 - users.test.js

