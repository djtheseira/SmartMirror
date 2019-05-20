let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

describe('Time Info', function() {
  it('Validate time structure', function(done){
    chai.request(app)
      .get("/time")
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('time');
        res.body.should.have.property('day');
        done();
      });
  });
});