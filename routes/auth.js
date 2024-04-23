const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin, authenticateJWT, getCurrentDateTime } = require("../middleware/auth");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req,res,next) => {
    try{
        const {username, password} = req.body;
        if(!username || !password) throw new ExpressError("username and password required", 400)
        const results = await db.query(
            `SELECT username, password 
             FROM users
             WHERE username = $1`,
            [username]);
          const user = results.rows[0];
          if (user) {
            if (await bcrypt.compare(password, user.password)) {
              const token = jwt.sign({ username }, SECRET_KEY);
              const date = getCurrentDateTime()
              const login = await db.query(
                `UPDATE users SET last_login_at=$1::timestamp with time zone WHERE username=$2`, [date, username]
              )
              req.session.user = {username: username, token: token}
              return res.json({ message: `Logged in!`, token })
            }
          }
          throw new ExpressError("Invalid username/password", 400);
    } catch (e){
        next(e)
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.post('/register', async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("Invalid username/password/first name/last name/phone. Please try again", 400);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const date = getCurrentDateTime();
    
    const results = await db.query(`
      INSERT INTO users (username, password, join_at, last_login_at, first_name, last_name, phone)
      VALUES ($1, $2, $3::timestamp with time zone, $3::timestamp with time zone, $4, $5, $6)
      RETURNING username`,
      [username, hashedPassword, date, first_name, last_name, phone]);

    const token = jwt.sign({ username }, SECRET_KEY);
    req.session.user = { username: username, token: token };

    return res.json({ username: username, id: results.rows[0].id, token: token });
  } catch (e) {
    if (e.code === '23505') {
      return next(new ExpressError("Username taken. Please pick another!", 400));
    }
    return next(e);
  }
});


module.exports = router