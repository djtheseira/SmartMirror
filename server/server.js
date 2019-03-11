let express = require("express");
const cookieParser = require("cookie-parser");
const cors = require('cors');

let app = express();
let routes = require('./routes/index')(app);
let server;
require('dotenv').config();
// app.use(express.static(__dirname + '/css'));

app.get('/', function(req, res) {
  //console.log('client:', process.env.SPOT_SECRET);
  res.status(200);//.send('');//{results: 'home boi'});
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500).send({ results: 'error', error: err.message });
  });
}

app//.use(express.static(__dirname + '/public'))
  .use(cookieParser())
  .use(cors())
  .use('/', routes);

server = app.listen(5001, function () {
  console.log('Example app listening on port 5001!');
});

stop = () => {
  server.close();
}

module.exports = app;
module.exports.stop = stop;