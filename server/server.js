let express = require("express");
let app = express();
let routes = require('./routes/index')(app);
let server;
// app.use(express.static(__dirname + '/css'));

server = app.listen(5001, function () {
  console.log('Example app listening on port 5001!');
});

app.get('/', function(req, res) {
  res.status(200).send({results: 'home boi'});
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500).send({ results: 'error', error: err.message });
  });
}

app.use(function(err, req, res, next) {  
  res.status(err.status || 500).send({ results: 'error' });
});

stop = () => {
  server.close();
}

module.exports = app;
module.exports.stop = stop;