'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runService;

var _contracts = require('@akashaproject/contracts.js');

var _contracts2 = _interopRequireDefault(_contracts);

var _indexModel = require('./indexModel');

var _services = require('./services');

var _ipfsConnector = require('@akashaproject/ipfs-connector');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getHash = function getHash(ipfsHashChunks, web3) {
  return web3.toUtf8(ipfsHashChunks[0]) + web3.toUtf8(ipfsHashChunks[1]);
};

var watcher = function watcher(contracts, blockNumber, cb) {
  var blockNr = blockNumber > _services.BLOCK_INTERVAL ? blockNumber - _services.BLOCK_INTERVAL : 0;
  var filter = { fromBlock: blockNr, toBlock: blockNumber };
  contracts.objects.entries.Publish({}, filter).get(function (err, data) {
    cb(err, { data: data, blockNr: blockNr });
    if (blockNumber !== 0) {
      return setTimeout(function () {
        return watcher(contracts, blockNr, cb);
      }, 100);
    }
  });
};

function runService() {
  var index = void 0;
  var web3 = (0, _services.getWeb3)();
  var factory = new _contracts2.default.Class(web3);
  (0, _indexModel.getIndex)(function (err, rIndex) {
    if (err) {
      throw err;
    }
    index = rIndex;
  });

  var getIpfs = function getIpfs(hash, entryId) {
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
    }).catch(function (err) {
      console.log('ERROR ', { hash: hash, entryId: entryId }, err);
    }).finally(function () {
      var found = false;
      index.search({ query: { AND: { title: [response.title], body: [response.body] } } }).on('data', function (data) {
        if (data.score > 1) {
          found = true;
        }
      }).on('end', function () {
        if (!found) {
          console.log('PUSHING', response);
          _indexModel.source.push(response);
        }
      });
    });
  };

  web3.eth.getBlockNumber(function (err, nr) {
    return watcher(factory, nr, function (err, found) {
      console.log(found);
      var i = 0;
      var save = function save() {
        factory.objects.entries.getEntry.call(found.data[i].args.entryId.toString(), function (e, d) {
          var entryIpfs = d[2];
          var resource = getHash(entryIpfs);
          var found = false;
          index.search({ query: { AND: { ipfsHash: [resource] } } }).on('data', function () {
            found = true;
          }).on('end', function () {
            if (!found) {
              _indexModel.source.push({ ipfsHash: resource });
            }

            return getIpfs(resource, found.data[i].args.entryId.toString()).then(function () {
              i++;
              if (i < found.length) {
                save();
              } else {
                _indexModel.source.push(null);
              }
            });
          });
        });
      };
    });
  });
}
//# sourceMappingURL=construct-index.js.map