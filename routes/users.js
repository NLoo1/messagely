const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', async (req, res, next ) => {
    try{
        const results = await db.query(
            `SELECT username, first_name, last_name, phone
            FROM users`
        )
        return res.json({users: results})
    } catch(e){
        return next(e)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', async (req,res,next) => {
    try{
        const username = req.body.username
        const results = await db.query('SELECT username, first_name, last_name, phone FROM users WHERE username=$1', [username])
        return res.json({user: results})
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

router.get('/:username/to', async (req,res,next) => {
    try{
        const username = req.body.username
        const results = await db.query('SELECT * FROM messages WHERE to_username=$1', [username])
        return res.json({messages: results})
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

router.get(':/username/from', async (req,res,next) => {
    try {
        const username = req.body.username
        const results = await db.query('SELECT * FROM messages WHERE from_username=$1', [username])
        return res.json({messages: results})
    } catch(e){
        return next(e)
    }
})


module.exports = router