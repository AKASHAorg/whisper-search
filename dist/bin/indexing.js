#! /usr/bin/env node
'use strict';

var _constructIndex = require('../src/construct-index');

var _constructIndex2 = _interopRequireDefault(_constructIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('Initializing indexing service daemon');
var daemon = new _constructIndex2.default({ objectMode: true });
if (process.env.PUMP_INDEX) {
  daemon.pump();
}
setTimeout(function () {
  return daemon.daemonize();
}, 10000);
//# sourceMappingURL=indexing.js.map