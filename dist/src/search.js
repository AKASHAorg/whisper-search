'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runService;

var _services = require('./services');

var _indexModel = require('./indexModel');

var lvlDb = void 0;
var installFilter = function installFilter(web3) {
  var filter = web3.shh.filter({ topics: [_services.SEARCH_REQUEST], to: (0, _services.getIdentity)() });
  filter.watch(function (err, message) {
    var payload = web3.toUtf8(message.payload);
    var jsonPayload = void 0;
    try {
      jsonPayload = JSON.parse(payload);
    } catch (err) {
      console.log(err);
    }
    if (!jsonPayload || !jsonPayload.text) {
      return;
    }
    var response = new Set();
    lvlDb.search({ query: { AND: { '*': [jsonPayload.text] } } }).on('data', function (data) {
      response.add(data.document.entryId);
    }).on('end', function () {
      var results = Array.from(response);
      //
    });

    if (!err) {
      web3.shh.post({
        from: identity,
        to: message.from,
        topics: [_services.SEARCH_REQUEST],
        payload: message.payload,
        ttl: web3.fromDecimal(10)
      }, function (error, sent) {
        if (sent) {
          console.log('Handshake done with', message.from);
        } else {
          console.error('Handshake error', error);
        }
      });
    }
  });
  return null;
};

function runService() {
  var web3 = (0, _services.getWeb3)();

  if ((0, _services.getIdentity)()) {
    (0, _indexModel.getIndex)(function (err, resp) {
      lvlDb = resp;
    });
    return installFilter(web3);
  }

  web3.shh.newIdentity(function (err, address) {
    console.log('SERVICE IDENTITY ', address);
    (0, _services.setIdentity)(address);
    return installFilter();
  });
}
//# sourceMappingURL=search.js.map