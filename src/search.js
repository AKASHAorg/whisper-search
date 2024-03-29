import { getWeb3, getIdentity, setIdentity, SEARCH_REQUEST } from './services';
import { getIndex } from './indexModel';
// NOT HERE
let lvlDb;
const installFilter = (web3, lvlDb) => {
  const filter = web3.shh.filter({ topics: [SEARCH_REQUEST], to: getIdentity() });
  filter.watch((err, message) => {
    const payload = web3.toUtf8(message.payload);
    let jsonPayload;
    try {
      jsonPayload = JSON.parse(payload);
    } catch (err) {
      console.log(err);
    }
    if (!jsonPayload || !jsonPayload.text) {
      return;
    }
    let response = new Set();
    const pageSize = (jsonPayload.pageSize) ? jsonPayload.pageSize : 20;
    const offset = (jsonPayload.offset) ? jsonPayload.offset: 0;

    lvlDb.totalHits({ query: [{ AND: { '*': [jsonPayload.text] } }] }, function (err, count) {
      lvlDb.search({ query: [{ AND: { '*': [jsonPayload.text] } }], pageSize: pageSize, offset: offset })
        .on('data', (data) => {
          console.log(data);
          console.log('pipe data ', data.document.entryId);
          response.add(data.document.entryId);
        }).on('end', () => {
        const results = JSON.stringify({ count: count, entries: Array.from(response) });
        const hexResult = web3.fromUtf8(results);
        web3.shh
          .post({
            from: identity,
            to: message.from,
            topics: [message.payload],
            payload: hexResult,
            ttl: web3.fromDecimal(10)
          }, (error, sent) => {
            if (sent) {
              console.log('search fs asdasdsadas done for keyword', payload, ' with results ', results);
            } else {
              console.error('search error for keyword', payload, error);
            }
          });
        //
      });
    });
  });
  return null;
};

export default function runService () {
  const web3 = getWeb3();

  if (getIdentity()) {
    getIndex((err, resp) => {
      console.log('err', err, 'resp', resp);
      lvlDb = resp;
      installFilter(web3, resp);
    });
    return;
  }

  web3.shh.newIdentity((err, address) => {
    console.log('SERVICE IDENTITY ', address);
    setIdentity(address);
    return installFilter(web3);
  });
}
