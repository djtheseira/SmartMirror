let express = require("express");
const cookieParser = require("cookie-parser");
const cors = require('cors');
let app = express();
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());
let routes = require('./server/routes/index')(app);
let server;
require('dotenv').config();
// app.use(express.static(__dirname + '/css'));

server = app.listen(5001, function () {
  console.log('Example app listening on port 5001!');
});

// app.get('/', function(req, res) {
//   //console.log('client:', process.env.SPOT_SECRET);
//   res.status(200);//.send('');//{results: 'home boi'});
// });

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500).send({ results: 'error', error: err.message });
  });
} else {
  app.use(function(err, req, res, next) {  
    res.status(err.status || 500).send({ results: 'error' });
  })
}

stop = () => {
  server.close();
}

module.exports = app;
module.exports.stop = stop;