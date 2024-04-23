const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin, authenticateJWT } = require("../middleware/auth");

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
              const date = Date.now()
              await db.query(
                `UPDATE users SET last_login=$1 WHERE username=$2`, [date, username]
              )
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
      const { username, password } = req.body;
      if (!username || !password) {
        throw new ExpressError("Username and password required", 400);
      }
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const date = Date.now()
      const results = await db.query(`
        INSERT INTO users (username, password, join_at, last_login_at)
        VALUES ($1, $2, $3, $3)
        RETURNING username`,
        [username, hashedPassword, date]);
      return res.json(results.rows[0]);
    } catch (e) {
      if (e.code === '23505') {
        return next(new ExpressError("Username taken. Please pick another!", 400));
      }
      return next(e)
    }
  });

module.exports = router