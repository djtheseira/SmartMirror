let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../server/server');
// let server;
let should = chai.should();

chai.use(chaiHttp);

// before(done => {
//   server = app.listen(5001, done);
// })

describe('Server Info', function() {
  it('check if server works', function(done){
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });
  // it('check redis server works');
  // it('check cache redis');
  // it('get current weather GET');
  // it('get 5 day forecast High/Low GET');
});

describe('Weather', function() {

  it('Get San Diego weather data', function(done) {
    chai.request(app)
      .get('/weather/1')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.results.should.have.property('location');
        res.body.results.should.have.property('current');
        res.body.results.current.should.be.a('object');
        res.body.results.should.have.property('forecast');
        res.body.results.location.should.equals("Azusa, CA, USA");
        res.body.results.forecast.should.be.a('object');
        // res.body.should.have.property('current');
        // res.body.should.have.property('forecast'); 
        done();
      });
  });

  it('No Weather Data, Bad City Id', function(done) {
    chai.request(app)
      .get('/weather/-1')
      .end(function(err,res) {
        res.should.have.status(404);        
        done();
      })
  });

  

});

after(async () => {
  app.stop();
});