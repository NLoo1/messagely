/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config"); 
const session = require('express-session');

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromSession = req.session.token;
    if (tokenFromSession) {
      const payload = jwt.verify(tokenFromSession, SECRET_KEY);
      req.session.user = payload; // create a current user in session
    }
    return next();
  } catch (err) {
    return next();
  }
}
/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).send('Unauthorized');
  }
}

/** Middleware: Requires correct username. */


function ensureCorrectUser(req, res, next) {
  if (req.session.user && req.session.user.username === req.params.username) {
    return next();
  } else {
    return next({ status: 401, message: "Unauthorized" });
  }
}



function getCurrentDateTime() {
  const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getUTCDate()).padStart(2, '0');
    const hours = String(currentDate.getUTCHours()).padStart(2, '0');
    const minutes = String(currentDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getUTCSeconds()).padStart(2, '0');
    const timeZoneOffset = currentDate.getTimezoneOffset();
    const sign = timeZoneOffset > 0 ? '-' : '+';
    const absOffset = Math.abs(timeZoneOffset);
    const hoursOffset = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const minutesOffset = String(absOffset % 60).padStart(2, '0');

    const formattedDateTimeWithTimeZone = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${sign}${hoursOffset}:${minutesOffset}`;
    
    return formattedDateTimeWithTimeZone;
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  getCurrentDateTime
};
