const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin, ensureCorrectUser, getCurrentDateTime } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async (req, res, next ) => {
    try{
        const results = await db.query(
            `SELECT first_name, last_name, phone, username
            FROM users`
        )
        return res.json({users: results.rows})
    } catch(e){
        return next(e)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, async (req,res,next) => {
    try{
        const username = req.params.username
        if(username != req.session.user.username) throw new ExpressError('Unauthorized', 400)
        const results = await db.query('SELECT first_name, join_at, last_login_at, last_name, phone, username FROM users WHERE username=$1', [username])
        if(results.rows[0]) return res.json({user: results.rows[0]})
        throw new ExpressError('User not found', 400)
    } catch(e){
        return next(e)
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, async (req,res,next) => {
    try{
        const username = req.params.username
        const results = await db.query('SELECT id,body,sent_at,read_at,from_username FROM messages WHERE to_username=$1', [username])
        if(results.rows[0]) return res.json({messages: results.rows[0]})
        throw new ExpressError('User not found or no messages', 400)
    } catch(e){
        return next(e)
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureCorrectUser, async (req,res,next) => {
    try {
        const username = req.params.username
        const results = await db.query('SELECT id,body,sent_at,read_at,to_username FROM messages WHERE from_username=$1', [username])
        if(results.rows[0]) return res.json({messages: results.rows[0] })
        throw new ExpressError('User not found or no messages', 400)
    } catch(e){
        return next(e)
    }
})


module.exports = router