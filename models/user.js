/** User class for message.ly */

const bcrypt = require("bcrypt");
const db = require("../db");
const ExpressError = require("../expressError");
const {getCurrentDateTime} = require("../middleware/auth")
const {BCRYPT_WORK_FACTOR, DB_PASSWORD} = require('../config')


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    // hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const date = getCurrentDateTime()
    const addUser = await db.query(`
    INSERT INTO users (username, password, first_name, last_name, phone, join_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING username, password, first_name, last_name, phone`,
    [username, hashedPassword, first_name, last_name, phone, date])

    return addUser.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username=$1`, [username]
    ) 
    const user = result.rows[0]
    if(user){
      const login = await bcrypt.compare(password, user.password)
      return login
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const date = getCurrentDateTime()
    const result = await db.query(
      `UPDATE users SET last_login_at=$1 WHERE username=$2 RETURNING username, last_login_at`, [date, username]
    )
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT first_name, last_name, phone, username FROM users`
    )
    return results.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(
      `SELECT first_name, join_at, last_login_at, last_name, phone, username FROM users WHERE username=$1`, [username]
    )
    return result.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const messages = await db.query(
      `SELECT body,from_username, id,read_at,sent_at FROM messages WHERE from_username=$1`, [username]
    )
    return JSON.stringify(messages.rows)
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messages = await db.query(
      `SELECT body,from_username, id,read_at,sent_at FROM messages WHERE to_username=$1`, [username]
    )
    return JSON.stringify(messages.rows)

   }
}


module.exports = User;