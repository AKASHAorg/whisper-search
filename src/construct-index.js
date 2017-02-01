import contracts from '@akashaproject/contracts.js';
import { source, getIndex } from './indexModel';
import { getWeb3, BLOCK_INTERVAL } from './services';
import { IpfsConnector } from '@akashaproject/ipfs-connector';

const getHash = (ipfsHashChunks, web3) => {
  return web3.toUtf8(ipfsHashChunks[0]) +
    web3.toUtf8(ipfsHashChunks[1]);
};

const watcher = (contracts, blockNumber, cb) => {
  const blockNr = (blockNumber > BLOCK_INTERVAL) ? (blockNumber - BLOCK_INTERVAL) : 0;
  const filter = { fromBlock: blockNr, toBlock: blockNumber };
  contracts.objects.entries.Publish({}, filter).get((err, data) => {
    cb(err, { data, blockNr });
    if (blockNumber !== 0) {
      return setTimeout(() => watcher(contracts, blockNr, cb), 100);
    }
  });
};



export default function runService () {
  let index;
  const web3 = getWeb3();
  const factory = new contracts.Class(web3);
  getIndex((err, rIndex) => {
    if (err) {
      throw err;
    }
    index = rIndex;
  });

  const getIpfs = (hash, entryId) => {
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
      })
      .catch((err) => {
        console.log('ERROR ', { hash, entryId }, err);
      })
      .finally(() => {
        let found = false;
        index.search({ query: { AND: { title: [response.title], body: [response.body] } } })
          .on('data', function (data) {
            if (data.score > 1) {
              found = true;
            }
          }).on('end', function () {
          if (!found) {
            console.log('PUSHING', response);
            source.push(response);
          }
        });
      });
  };

  web3.eth.getBlockNumber((err, nr) => {
    return watcher(factory, nr, (err, found) => {
      console.log(found);
      let i =0 ;
      const save = () => {
        factory.objects.entries.getEntry.call((found.data[i].args.entryId).toString(), (e, d) => {
          const entryIpfs = d[2];
          const resource = getHash(entryIpfs);
          let found = false;
          index.search({ query: { AND: { ipfsHash: [resource] } } }).on('data', function () {
            found = true;
          }).on('end', function () {
            if (!found) {
              source.push({ ipfsHash: resource });
            }

            return getIpfs(resource, (found.data[i].args.entryId).toString()).then(() => {
              i++ ;
              if(i<found.length){
                save();
              }else{
                source.push(null);
              }
            });
          });
        });
      }
    });
  });

}
