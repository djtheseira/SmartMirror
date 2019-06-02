const rssParser = require("rss-parser");
const moment = require('moment-timezone');
let parser = new rssParser();
const rssUrls = [
  "http://feeds.bbci.co.uk/news/rss.xml",
  "https://www.techmeme.com/feed.xml",
  "https://www.npr.org/rss/rss.php"
];
require('dotenv').config();

exports.getFeeds = async (req, res) => {
  let timezone = req.query.timezone ? req.query.timezone : 'America/Los_Angeles';
  let news = [];
  for(let i = 0; i < rssUrls.length; i++) {
    let url = rssUrls[i];
    let feed = await parser.parseURL(url);
    // console.log(feed.items);
    feed.items.every((item, idx) => {      
      let time = moment(item.isoDate).tz(timezone).format("DD MMMM YYYY HH:mm");
      // let pubDateMoment = moment(item.pubDate.replace("GMT", "+0000"), "ddd, DD MMMM YYYY HH:mm:ss Z").format("DD MMMM YYYY HH:mm Z");
      let entry = {
        title: item.title,
        source: feed.title,
        link: item.link,
        time,
        pubDate: item.pubDate.replace("GMT", "+0000"),
      }
      news.push(entry);
      return idx < 4;
    });
  }

  news = news.sort(sortNews);
  news = news.slice(0,5);
  res.status(200).send({news});
}

let sortNews = (a, b) => {
  let aStart = moment(a.pubDate, "ddd, DD MMMM YYYY HH:mm:ss Z");
  let bStart = moment(b.pubDate, "ddd, DD MMMM YYYY HH:mm:ss Z");
  let diff = bStart.diff(aStart);
  return diff;
}