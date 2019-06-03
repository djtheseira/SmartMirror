const {google} = require('googleapis');
const moment = require('moment-timezone');

require('dotenv').config();

const authClient = new google.auth.OAuth2(
  process.env.GCAL_CLIENT_ID,
  process.env.GCAL_CLIENT_SECRET,
  process.env.GCAL_REDIRECT
);

let authUrl = authClient.generateAuthUrl({
  access_type: 'offline',
  scope: process.env.GSCOPE
});

// Test this out and see wut it does
// authClient.on('tokens', (tokens) => {
//   if (tokens.refresh_token) {
//     console.log(refresh_token);
//   }
//   console.log(tokens.access_token);
// })

exports.getUserAuth = (req, res) => {
  let gcal_token = req.cookies ? req.cookies['gcal_token'] : '';
  if (gcal_token) {
    authClient.setCredentials({refresh_token: gcal_token});
    res.status(200).send({status: 1});
  } else {
    res.status(200).send({ url: authUrl });
  }
}

exports.oAuthCallBack = async (req, res) => {
  let authCode = req.query.code;
  let refresh = "";
  if (authCode) {
    try {
      await authClient.getToken(authCode)
        .then(results => {
          if (results.tokens) {
            authClient.setCredentials(results.tokens);
            refresh = results.tokens.refresh_token;
            res.cookie('gcal_token', refresh);
          }
        })
        .catch (error => {
          console.log('Error getting token: ', error);
          res.cookie("gcal_token", { maxAge: Date.now()});
        });
    } catch (error) {
      console.log('error getting token: ', error);
      res.cookie("gcal_token", { maxAge: Date.now()});
    }
  }
  res.render('exit', {refresh});
}

exports.getCalendarItems = async (req, res) => {
  let timezone = req.query.timezone ? req.query.timezone : 'America/Los_Angeles';
  let gcal_token = req.cookies ? req.cookies['gcal_token'] : '';
  if (!gcal_token) {
    gcal_token = authClient.credentials.refresh_token;
    if (gcal_token) {
      res.cookie('gcal_token', gcal_token);
    } else {
      res.status(400).send({"error": "Please clear your cookies or try again later."});
      return;
    }
  }

  authClient.setCredentials({refresh_token: gcal_token});

  const calendar = google.calendar({version: 'v3', auth: authClient});
  let calIds = await getCalendarIds(calendar)
    .catch(error => {
      console.log('getcalendarids: ' + error.message);
      res.status(400).send({error: "Please refresh the page and ensure you have granted the correct permissions."});
  });

  if (!calIds) return;
  let events = [];
  let today = moment(moment().tz(timezone).format("YYYY-MM-DD")).format("YYYY-MM-DDTHH:00:00Z");
  let tomorrow =moment(moment().tz(timezone).format("YYYY-MM-DD")).add({days: 1}).format("YYYY-MM-DDTHH:00:00Z");
  for (let idx = 0; idx < calIds.length; idx++) {
    let id = calIds[idx];
    let params = {
      calendarId: id,
      maxResults: 5,
      timeMin: today,
      timeMax: tomorrow,
      singleEvents: true,
    }
    events.concat(await getCalenderEvents(calendar, params, events));
  }

  events.sort(sortEvents);

  // events.forEach((item, idx) => {
  //   console.log('Event Start DateTime: ', item.start.dateTime);
  //   console.log('Event End Date Time: ', item.end.dateTime);
  // });

  res.status(200).send({events});
}

// Gets the users calendarid's, based on if the user has the calendar selected.
let getCalendarIds = async (calendar) => {
  let calIds = [];
  let calListData = await calendar.calendarList.list({maxResults: 10});
  calListData.data.items.forEach((item, idx) => {
    if (item.selected) {
      calIds.push(item.id);
    }
  });
  return calIds;
}

// Gets the events for a specific calendar.
let getCalenderEvents = async (calendar, params, events) => {
  let calendarEventsResults = await calendar.events.list(params);
  calendarEventsResults.data.items.forEach((item, idx) => {
    if (item.start.dateTime) {
      item.timeSpan = moment(item.start.dateTime).format("HH:mm") + " - " + moment(item.end.dateTime).format("HH:mm");
    }
    events.push(item);
  });
  return events;
}

// Sort by start date, returning oldest first.
let sortEvents = (a, b) => {
  let aStart = moment(a.start.date ? a.start.date : a.start.dateTime);
  let bStart = moment(b.start.date ? b.start.date : b.start.dateTime);
  let diff = aStart.diff(bStart);
  return diff > 0;
}
