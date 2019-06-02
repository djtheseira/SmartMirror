let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

describe('Market Info', function() {
  it('Check that getting market is valid, no custom coins.', function (done) {
    chai.request(app)
      .get("/market")
      .end(function(err, res) {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        done();
      });
  });

  it('Check that getting market is valid, custom coins.', function (done) {
    chai.request(app)
      .get("/market?coins=BTC,ETH,TRX,VTC,STRAT,OMG,ICX")
      .end(function(err, res) {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.results.should.have.property('crypto');
        done();
      });
  });

  it('Check that getting market is valid, custom stocks', function (done) {
    chai.request(app)
      .get("/market?stocks=AMD,NVDA,GLW,MU,SPOT")
      .end(function(err, res) {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.results.should.have.any.keys('stock');
        done();
      });
  });

  it('Check that getting market is valid, custom coins and stocks', function (done) {
    chai.request(app)
      .get("/market?stocks=AMD,NVDA,GLW,MU,SPOT&coins=XRP,BTC,ETH,BTC,NEO")
      .end(function(err, res) {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.results.should.have.all.keys('crypto', 'stock');
        done();
      });
  });

  it('Test invalid market coin info', function (done) {
    chai.request(app)
      .get("/market?coins=adwa")
      .end(function(err, res) {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.results.crypto.should.have.property('Error');
        done();
      });
  });

  it('Test invalid market stock info', function (done) {
    chai.request(app)
      .get("/market?stocks=adwa")
      .end(function(err, res) {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('results');
        res.body.results.crypto.should.not.have.property('stock');
        done();
      });
  })

});