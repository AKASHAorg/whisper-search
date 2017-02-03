'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.consume = exports.getIndex = exports.db = undefined;

var _path = require('path');

var _searchIndex = require('search-index');

var _searchIndex2 = _interopRequireDefault(_searchIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = exports.db = process.env.SEARCH_DB_PATH ? process.env.SEARCH_DB_PATH : (0, _path.join)(__dirname, 'db');
var options = { indexPath: db };

var getIndex = exports.getIndex = function getIndex(cb) {
  (0, _searchIndex2.default)(options, function (err, index) {
    cb('', index);
  });
};

var consume = exports.consume = function consume(source, index) {
  source.pipe(index.defaultPipeline()).pipe(index.add()).on('data', function (d) {
    // nothing :D
  }).on('end', function () {
    console.log('completed add');
  });
};
//# sourceMappingURL=indexModel.js.map