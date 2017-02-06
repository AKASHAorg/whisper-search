import { getWeb3, getIdentity, setIdentity, HANDSHAKE_REQUEST, HANDSHAKE_RESPONSE } from './services';


const installFilter = (web3) => {
  const filter = web3.shh.filter({ topics: [HANDSHAKE_REQUEST], to: getIdentity() });
  filter.watch((err, message) => {
    if (!err) {
      web3.shh
        .post({
          from: getIdentity(),
          to: message.from,
          topics: [HANDSHAKE_RESPONSE],
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

  if (getIdentity()) {
    return installFilter(web3);
  }

  web3.shh.newIdentity((err, address) => {
    console.log(err, address);
    console.log('SERVICE IDENTITY ', address);
    setIdentity(address);
    return installFilter(web3);
  });
}
