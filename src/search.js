import { getWeb3, getIdentity, setIdentity, SEARCH_REQUEST } from './services';
import { getIndex } from './indexModel';

let lvlDb;
const installFilter = (web3) => {
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
    lvlDb.totalHits({ query: { AND: { '*': [jsonPayload.text] } } }, function (err, count) {
      const pageSize = (jsonPayload.pageSize) ? jsonPayload.pageSize : 20;
      lvlDb.search({ query: { AND: { '*': [jsonPayload.text] } }, pageSize: pageSize, offset: jsonPayload.offset })
        .on('data', (data) => {
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
              console.log('search done for keyword', payload, ' with results ', results);
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
      lvlDb = resp;
    });
    return installFilter(web3);
  }

  web3.shh.newIdentity((err, address) => {
    console.log('SERVICE IDENTITY ', address);
    setIdentity(address);
    return installFilter(web3);
  });
}
