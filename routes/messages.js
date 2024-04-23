const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin, ensureCorrectUser } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureCorrectUser, async (req, res, next) => {
    const user = req.body.id
    const results = await db.query(
        `SELECT id, body, sent_at, from_user, to_user FROM users WHERE username=$1`, [user]
    )
    if(results.rows[0]) return res.json({message: results.rows[0]})
    throw new ExpressError('User not found', 400)
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) =>{
    const from_user = req.user.username
    const to_user = req.body.to_username
    const body = req.body.body
    const date = Date.now()
    const results = await db.query(
        `INSERT INTO messages (from_username, to_username, body, sent_at) VALUES ($1,$2,$3,$4) RETURNING id, from_username, to_username, body, sent_at`, [from_user,to_user,body,date]
    )
    if(results.rows[0]) return res.json({message: results.rows[0]})
    throw new ExpressError('User not found', 400)
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureCorrectUser, async (req, res, next) => {
    const user = req.body.id
    const date = Date.now()
    const results = await db.query(
        `UPDATE messages SET read_at=$1 WHERE username=$2 RETURNING id, read_at`, [date,user]
    )
    if(results.rows[0]) return res.json({message: results.rows[0]})
    throw new ExpressError('User not found', 400)
})

module.exports = router;