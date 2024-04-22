/** Database connection for messagely. */

const { Client } = require('pg');
const { DB_URI, DB_PASSWORD, DB_USERNAME } = require("./config");

const client = new Client({
  user: DB_USERNAME,
  host: 'localhost',
  password: DB_PASSWORD,
  database: DB_URI,
  port: 5432, 
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

module.exports = client