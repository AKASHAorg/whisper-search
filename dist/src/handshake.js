'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runService;

var _services = require('./services');

var installFilter = function installFilter(web3) {
  var filter = web3.shh.filter({ topics: [_services.HANDSHAKE_REQUEST], to: (0, _services.getIdentity)() });
  filter.watch(function (err, message) {
    if (!err) {
      web3.shh.post({
        from: (0, _services.getIdentity)(),
        to: message.from,
        topics: [_services.HANDSHAKE_RESPONSE],
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
    return installFilter(web3);
  }

  web3.shh.newIdentity(function (err, address) {
    console.log(err, address);
    console.log('SERVICE IDENTITY ', address);
    (0, _services.setIdentity)(address);
    return installFilter(web3);
  });
}
//# sourceMappingURL=handshake.js.map