/** User class for message.ly */

const ExpressError = require("../expressError");



/** User of the site. */

class User {

  checkUserAndPassword(user, password=None){
    if(password==None && !user) throw new ExpressError("Username required", 400);
    else if (!username || !password) throw new ExpressError("Username and password required", 400);
    return
    }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    checkUserAndPassword(username, password)
    // hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const addUser = await DB_PASSWORD.query(`
    INSERT INTO users (username, password, first_name, last_name, phone)
    VALUES ($1, $2)
    RETURNING username, password, first_name, last_name, phone`,
    [username, hashedPassword, first_name, last_name, phone])

    return jsonify(addUser)
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    checkUserAndPassword(username, password)
    const result = await db.query(
      `SELECT password FROM users WHERE username=$1` [username]
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
    const date = Date.now()
    const result = await db.query(
      `UPDATE users SET last_login_at=$1 WHERE username=$2 RETURNING username, last_login_at`, [date, username]
    )
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`
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
    checkUserAndPassword(username)
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username=$1`, [username]
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
    checkUserAndPassword(username)
    const messages = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM messages WHERE from_user=$1`, [username]
    )
    return messages.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    checkUserAndPassword(username)
    const messages = await db.query(
      `SELECT * FROM messages WHERE to_user=$1`, [username]
    )
    return messages.rows

   }
}


module.exports = User;