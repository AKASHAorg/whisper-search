'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;

var _ipfsApi = require('ipfs-api');

var _ipfsApi2 = _interopRequireDefault(_ipfsApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init() {

  var ipfsApiPath = process.env.IPFS_API_ADDRESS ? process.env.IPFS_API_ADDRESS : '/ip4/127.0.0.1/tcp/5001';
  return (0, _ipfsApi2.default)(ipfsApiPath);
}
//# sourceMappingURL=ipfs-api-connection.js.map