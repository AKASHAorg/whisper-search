'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _contracts = require('@akashaproject/contracts.js');

var _contracts2 = _interopRequireDefault(_contracts);

var _indexModel = require('./indexModel');

var _services = require('./services');

var _ipfsConnector = require('@akashaproject/ipfs-connector');

var _stream = require('stream');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TransportIndex = function (_Readable) {
  _inherits(TransportIndex, _Readable);

  function TransportIndex(opt) {
    _classCallCheck(this, TransportIndex);

    var _this = _possibleConstructorReturn(this, (TransportIndex.__proto__ || Object.getPrototypeOf(TransportIndex)).call(this, opt));

    _this.web3 = (0, _services.getWeb3)();
    _this.factory = new _contracts2.default.Class(_this.web3);
    _this.indexS = '';
    _this._index = 0;
    _this.pool = new Set();
    _this.idList = '';
    _this.blockNumber = '';
    _this.daemonBlock = '';
    (0, _indexModel.getIndex)(function (err, resp) {
      _this.indexS = resp;
    });

    _this.web3.eth.getBlockNumber(function (err, nr) {
      _this.blockNumber = nr;
      _this.daemonBlock = nr;
      _this.pull();
    });
    return _this;
  }

  _createClass(TransportIndex, [{
    key: 'getHash',
    value: function getHash(ipfsHashChunks) {
      return this.web3.toUtf8(ipfsHashChunks[0]) + this.web3.toUtf8(ipfsHashChunks[1]);
    }
  }, {
    key: 'pull',
    value: function pull() {
      var _this2 = this;

      var blockNr = this.blockNumber > _services.BLOCK_INTERVAL ? this.blockNumber - _services.BLOCK_INTERVAL : 0;
      var filter = { fromBlock: blockNr, toBlock: this.blockNumber };
      if (this.blockNumber === 0) {
        this.idList = Array.from(this.pool);
        this.pool.clear();
        return this.emit('donePull', true);
      }

      this.factory.objects.entries.Publish({}, filter).get(function (err, data) {
        for (var i = 0; i < data.length; i++) {
          _this2.pool.add(data[i].args.entryId.toString());
        }
        _this2.pull();
      });
      this.blockNumber = blockNr;
    }
  }, {
    key: 'fetchIpfs',
    value: function fetchIpfs(hash, entryId) {
      var response = { title: '', body: '', entryId: entryId };
      return _ipfsConnector.IpfsConnector.getInstance().api.get(hash).then(function (resp) {
        response.title = resp.title;
        return _ipfsConnector.IpfsConnector.getInstance().api.findLinks(hash, ['excerpt']);
      }).then(function (resp) {
        if (resp.length) {
          return _ipfsConnector.IpfsConnector.getInstance().api.get(resp[0].multihash);
        }
      }).then(function (final) {
        response.body = final;
        return response;
      }).catch(function (err) {
        console.log('ERROR ', { hash: hash, entryId: entryId }, err);
      });
    }
  }, {
    key: '_read',
    value: function _read() {
      var _this3 = this;

      if (this._index === this.idList.length) {
        this.push(null);
      } else {
        this.factory.objects.entries.getEntry.call(this.idList[this._index], function (e, d) {
          var entryIpfs = d[2];
          var resource = _this3.getHash(entryIpfs);
          return _this3.fetchIpfs(resource, _this3.idList[_this3._index++]).then(function (ipfsData) {
            if (ipfsData) {
              var _ret = function () {
                var found = false;
                _this3.indexS.search({ query: { AND: { title: [ipfsData.title] } } }).on('data', function (data) {
                  if (data.score > 1) {
                    found = true;
                  }
                }).on('end', function () {
                  if (!found) {
                    console.log('PUSHING', ipfsData);
                    return _this3.push(ipfsData);
                  }
                  return _this3.push({});
                });
                return {
                  v: null
                };
              }();

              if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
            return _this3.push({});
          });
        });
      }
    }
  }, {
    key: 'pump',
    value: function pump() {
      var _this4 = this;

      this.on('donePull', function () {
        (0, _indexModel.consume)(_this4, _this4.indexS);
      });
    }
  }, {
    key: 'daemonize',
    value: function daemonize() {
      var _this5 = this;

      console.log('starting daemon', this.daemonBlock);
      var watcher = this.factory.objects.entries.Publish({}, { fromBlock: this.daemonBlock, toBlock: 'latest' });
      watcher.watch(function (err, published) {
        _this5.factory.objects.entries.getEntry.call(published.args.entryId.toString(), function (e, d) {
          var entryIpfs = d[2];
          var resource = _this5.getHash(entryIpfs);
          return _this5.fetchIpfs(resource, published.args.entryId.toString()).then(function (ipfsData) {
            if (ipfsData) {
              (function () {
                var found = false;
                _this5.indexS.search({ query: { AND: { title: [ipfsData.title], body: [ipfsData.body] } } }).on('data', function (data) {
                  if (data.score > 1) {
                    found = true;
                  }
                }).on('end', function () {
                  if (!found) {
                    var newIndex = new _stream.Readable({ objectMode: true });
                    newIndex.push(ipfsData);
                    newIndex.push(null);
                    (0, _indexModel.consume)(newIndex, _this5.indexS);
                  }
                });
              })();
            }
          });
        });
      });
    }
  }]);

  return TransportIndex;
}(_stream.Readable);

exports.default = TransportIndex;
//# sourceMappingURL=construct-index.js.map