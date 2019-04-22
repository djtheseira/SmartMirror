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
  if (authCode) {
    console.log('authCode: ', authCode);
    try {
      await authClient.getToken(authCode, (err, tokens) => {
        if (err) return console.log('error: ', err);
        authClient.setCredentials(tokens);
        console.log('tokens: ', tokens);
        // res.cookie("gcal_token", tokens.refresh_token);
        // TODO: Store refresh token for auto-refresh
      });
    } catch (error) {
      console.log('error getting token: ', error);
    }
  }
  
  res.render('exit');
}

exports.getCalendarItems = async (req, res) => {
  let timezone = req.query.timezone ? req.query.timezone : 'America/Los_Angeles';
  let date = "";
  
  const calendar = google.calendar({version: 'v3', auth: authClient});
  let gcal_token = req.cookies ? req.cookies['gcal_token'] : '';
  if (!gcal_token) {
    gcal_token = authClient.credentials.refresh_token;
    res.cookie('gcal_token', gcal_token);
  }

  let calIds = await getCalendarIds(calendar).catch(console.error);
  let events = [];
  let today = moment.tz(timezone).format("YYYY-MM-DDT00:00:00-00:00");
  let tomorrow = moment().add(1, "days").tz(timezone).format("YYYY-MM-DDT00:00:00-00:00");
  console.log(today);
  console.log(tomorrow);
  console.log('blah');
  for (let idx = 0; idx < calIds.length; idx++) {
    let id = calIds[idx];
    console.log('id: ', id);
    let params = {
      calendarId: id,
      maxResults: 5,
      timeMin: today,
      timeMax: tomorrow,
      // singleEvents: true
    }
    events = await getCalenderEvents(calendar, params, events);
    // await getCalenderEvents(calendar, params, events)
  }

  // console.log(events);
  events.forEach((item, idx) => {
    // console.log(item);
    console.log('----item start----');
    console.log('Creator Name: ', item.creator.displayName);
    console.log('Creator Email: ', item.creator.email);
    console.log('Calendar Name: ', item.organizer.displayName);
    console.log('Summary: ', item.summary);
    console.log('Event Start Date: ', item.start.date);
    console.log('Event Start DateTime: ', item.start.dateTime);
    console.log('Event End Date: ', item.end.date);
    console.log('Event End Date Time: ', item.end.dateTime);
    console.log('Event Location: ', item.location);
    console.log('----item end----');
  });

  res.status(200).send({'data': "hi"});
}

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

let getCalenderEvents = async (calendar, params, events) => {
  let calendarEventsResults = await calendar.events.list(params);
  // events.push(calendarEventsResults.data.items);
  console.log(calendarEventsResults.data.items.length);
  calendarEventsResults.data.items.forEach((item, idx) => {
    events.push(item);
  });
  return events;
}
