const rp = require('request-promise');
const util = require('util');
require('dotenv').config();

const ccUrl = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=[fsyms]&tsyms=USD";
const iexUrl = "https://api.iextrading.com/1.0/stock/market/batch?symbols=[fsyms]&types=quote";
const defaultCoins = "BTC,ETH,NEO,XRP,VTC,OMG,TRX,SC";
const defaultStocks = "AMD,MU,GLW,AAPL,FB,SNAP,RTN,BABA,QCOM,TSLA"

exports.getMarketPrices = async (req, res) => {
  let coins = req.query.coins ? req.query.coins : defaultCoins;
  let coinUrl = ccUrl.replace('[fsyms]', coins);
  let stocks = req.query.stocks ? req.query.stocks : defaultStocks;
  let stockUrl = iexUrl.replace('[fsyms]', stocks);
  let results = {};
  let status = 200;

  if (coins) {
    let crypto = await getCryptoPrices(coinUrl);
    results.crypto = crypto;

    if (crypto.status) {
      status = crypto.status;
    }
  }

  if (stocks) {
    let stock = await getStockPrices(stockUrl);
    if (stock.length > 0) {
      results.stock = stock;
    }
    if (stock.status) {
      status = stock.status;
    }
  }
  
  res.status(status).send({ results });
}

let getCryptoPrices = async(coinsUrl) => {
  let cyrptoOptions = {
    uri: coinsUrl
  }
  let cryptoPrices = await rp(cyrptoOptions)
    .then(results => {
      let json = JSON.parse(results);
      
      if (json["Response"] === "Error") {
        return {"Error": json["Message"], "ParameterWithError": json["ParamWithError"]};
      }
      let cryptos = [];
      let raw = json.RAW;
      Object.keys(raw).forEach((key, idx) => {
        let usd = raw[key].USD;
        let change = Math.ceil(usd.CHANGEPCTDAY * 100)/100;
        let crypto = {
          coin: key,
          price: "$" + usd.PRICE.toFixed(2).toLocaleString(),
          change
        };
        cryptos.push(crypto);
      })
      return cryptos;
    })
    .catch(err => {
      return { status: 400, "Error": err.message };
    });
  return cryptoPrices;
}

let getStockPrices = async(stockUrl) => {
  let stockOptions = {
    uri: stockUrl
  }
  let stockPrices = await rp(stockOptions)
    .then(results => {
      let json = JSON.parse(results);
      let stocks = [];
      Object.keys(json).forEach((key, idx) => {
        let quote = json[key].quote;
        let change = Math.ceil(quote.changePercent * 10000)/100;



        let stock = {
          symbol: quote.symbol,
          price: "$" + quote.latestPrice.toFixed(2).toLocaleString(),
          change
        };
        stocks.push(stock);
      });
      return stocks;
    })
    .catch(err => {
      return { status: 400, "Error": err.message };
    });
  return stockPrices;
}