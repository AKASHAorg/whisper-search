import { getWeb3, getIdentity, setIdentity, SEARCH_REQUEST } from './services';
import { getIndex } from './indexModel';

let lvlDb;
const installFilter = (web3) => {
  const filter = web3.shh.filter({ topics: [SEARCH_REQUEST], to: getIdentity() });
  filter.watch((err, message) => {
    const payload = web3.toUtf8(message.payload);
    let jsonPayload;
    try{
      jsonPayload = JSON.parse(payload);
    }catch (err) {
      console.log(err);
    }
    if(!jsonPayload || !jsonPayload.text){return;}
    let response = new Set();
    lvlDb.search({ query: { AND: { '*': [jsonPayload.text] } } })
      .on('data', (data) => {
        response.add(data.document.entryId);
      }).on('end', () => {
      const results = Array.from(response);
      //
    });

    if (!err) {
      web3.shh
        .post({
          from: identity,
          to: message.from,
          topics: [SEARCH_REQUEST],
          payload: message.payload,
          ttl: web3.fromDecimal(10)
        }, (error, sent) => {
          if (sent) {
            console.log('Handshake done with', message.from);
          } else {
            console.error('Handshake error', error);
          }
        });
    }
  });
  return null;
};

export default function runService () {
  const web3 = getWeb3();


  if(getIdentity()){
    getIndex((err, resp) => {
      lvlDb = resp;
    });
    return installFilter(web3);
  }

  web3.shh.newIdentity((err, address) => {
    console.log('SERVICE IDENTITY ', address);
    setIdentity(address);
    return installFilter();
  });
}
