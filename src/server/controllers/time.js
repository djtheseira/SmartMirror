// require('moment');
const moment = require('moment-timezone');
require('dotenv').config();
let lang = "en";
const quotes = [
  "Once you understand that you're getting better, you will fall into a constant flow of work and never look back.",
  "Don't follow the rules.",
  "Keep it simple.",
  "Logic will get you from A to B. Imagination will take you everywhere.",
  "Life starts at the end of your comfort zone.",
  "Life is 10% what happens to you and 90% how you react to it.",
  "It does not matter how slowly you go, as long as you do not stop.",
  "Good, better, best. Never let it rest. Til your good is better and your better is best.",
  "Remember your dreams and fight for them. The fear of failure is the only thing stopping you.",
  "Failure is nothing more than a chance to revise your strategy."
]

exports.getCurrentDateAndTime = (req, res) => {
  let timezone = req.query.timezone ? req.query.timezone : 'America/Los_Angeles';
  let formatTime = 'HH:mm';
  let formatDay = 'dddd LL';

  let time = moment.tz(timezone).format(formatTime);
  let day = moment.tz(timezone).format(formatDay);
  let quote = quotes[Math.floor(Math.random() * (quotes.length - 0 + 1))];

  res.status(200).send({ time, day, quote });
  
}