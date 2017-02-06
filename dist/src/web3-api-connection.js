'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init() {
  var web3 = new _web2.default();
  var socket = new _net2.default.Socket();
  var ipcPath = process.env.GETH_IPC_PATH; //

  socket.setTimeout(0);
  socket.setEncoding('utf8');
  web3.setProvider(new _web2.default.providers.IpcProvider(ipcPath, socket));

  return web3;
}
//# sourceMappingURL=web3-api-connection.js.map