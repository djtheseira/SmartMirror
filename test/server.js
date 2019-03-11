let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

describe('Server Info', function() {
  it('check if server works', function(done){
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
      });
      done();
  });
  // it('check redis server works');
  // it('check cache redis');
});