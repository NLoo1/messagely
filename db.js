/** Database connection for messagely. */

const { Client } = require('pg');
const { DB_URI } = require("./config");

const client = new Client({
  user: process.env.user,
  host: 'localhost',
  password: process.env.password,
  database: DB_URI,
  port: 5432, 
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

module.exports = client