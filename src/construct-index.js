import contracts from '@akashaproject/contracts.js';
import { getIndex, consume } from './indexModel';
import { getWeb3, BLOCK_INTERVAL } from './services';
import { IpfsConnector } from '@akashaproject/ipfs-connector';
import { Readable } from 'stream';
export default class TransportIndex extends Readable {

  constructor (opt) {
    super(opt);
    this.web3 = getWeb3();
    this.factory = new contracts.Class(this.web3);
    this.indexS = '';
    this._index = 0;
    this.pool = new Set();
    this.idList = '';
    this.blockNumber = '';
    this.daemonBlock = '';
    getIndex((err, resp) => {
      this.indexS = resp;
    });

    this.web3.eth.getBlockNumber((err, nr) => {
      this.blockNumber = nr;
      this.daemonBlock = nr;
      this.pull();
    });
  }

  getHash (ipfsHashChunks) {
    return this.web3.toUtf8(ipfsHashChunks[0]) +
      this.web3.toUtf8(ipfsHashChunks[1]);
  }

  pull () {
    const blockNr = (this.blockNumber > BLOCK_INTERVAL) ? (this.blockNumber - BLOCK_INTERVAL) : 0;
    const filter = { fromBlock: blockNr, toBlock: this.blockNumber };
    if (this.blockNumber === 0) {
      this.idList = Array.from(this.pool);
      this.pool.clear();
      return this.emit('donePull', true);
    }

    this.factory.objects.entries.Publish({}, filter).get((err, data) => {
      for (let i = 0; i < data.length; i++) {
        this.pool.add((data[i].args.entryId).toString())
      }
      this.pull();
    });
    this.blockNumber = blockNr;
  }

  fetchIpfs (hash, entryId) {
    let response = { title: '', body: '', entryId: entryId };
    return IpfsConnector.getInstance().api.get(hash)
      .then((resp) => {
        response.title = resp.title;
        return IpfsConnector.getInstance().api.findLinks(hash, ['excerpt']);
      })
      .then((resp) => {
        if (resp.length) {
          return IpfsConnector.getInstance().api.get(resp[0].multihash)
        }
      })
      .then((final) => {
        response.body = final;
        return response;
      })
      .catch((err) => {
        console.log('ERROR ', { hash, entryId }, err);
      })
  }


  _read () {
    if (this._index === this.idList.length) {
      this.push(null);
    }
    else {
      this.factory.objects.entries.getEntry.call(this.idList[this._index], (e, d) => {
        const entryIpfs = d[2];
        const resource = this.getHash(entryIpfs);
        return this.fetchIpfs(resource, this.idList[this._index++]).then((ipfsData) => {
          if (ipfsData) {
            let found = false;
            this.indexS.search({ query: { AND: { title: [ipfsData.title] } } })
              .on('data', (data) => {
                if (data.score > 1) {
                  found = true;
                }
              }).on('end', () => {
              if (!found) {
                console.log('PUSHING', ipfsData);
                return this.push(ipfsData);
              }
              return this.push({});
            });
            return null;
          }
          return this.push({});
        });
      });
    }
  }

  pump () {
    this.on('donePull', () => {
      consume(this, this.indexS);
    });
  }

  daemonize () {
    console.log('starting daemon', this.daemonBlock);
    const watcher = this.factory.objects.entries.Publish({}, { fromBlock: this.daemonBlock, toBlock: 'latest' });
    watcher.watch((err, published) => {
      this.factory.objects.entries.getEntry.call((published.args.entryId).toString(), (e, d) => {
        const entryIpfs = d[2];
        const resource = this.getHash(entryIpfs);
        return this.fetchIpfs(resource, (published.args.entryId).toString()).then((ipfsData) => {
          if (ipfsData) {
            let found = false;
            this.indexS.search({ query: { AND: { title: [ipfsData.title], body: [ipfsData.body] } } })
              .on('data', (data) => {
                if (data.score > 1) {
                  found = true;
                }
              }).on('end', () => {
              if (!found) {
                const newIndex = new Readable({ objectMode: true });
                newIndex.push(ipfsData);
                newIndex.push(null);
                consume(newIndex, this.indexS);
              }
            });
          }
        });
      });
    });
  }
}
