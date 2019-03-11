// require('moment');
const moment = require('moment-timezone');
require('dotenv').config();
let lang = "en";

exports.getCurrentDateAndTime = (req, res) => {
  let timezone = req.query.timezone ? req.query.timezone : 'America/Los_Angeles';
  let formatTime = 'h:mm';
  let formatDay = 'MMMM DD, YYYY';

  let time = moment.tz(timezone).format(formatTime);
  let day = moment.tz(timezone).format(formatDay);

  res.status(200).send({ time, day });
  
}