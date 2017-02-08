import web3 from './web3-api-connection';
import ipfs from './ipfs-api-connection';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export const services = {
  web3: null,
  ipfs: null,
  whisperIdentity: null
};

export const getWeb3 = () => {
  if (!services.web3) {
    services.web3 = web3();
  }
  return services.web3;
};

export const getIpfs = () => {
  if (!services.ipfs) {
    services.ipfs = ipfs();
  }
  return services.ipfs;
};

const token = Buffer.from((new Date()).toDateString());
const segment = join(__dirname, '../../identities');
const file = join(segment, token.toString('hex') + '_identity.json');

export const setIdentity = (newIdentity) => {
  return writeFileSync(file, newIdentity);
};

export const getIdentity = () => {
  if (!services.whisperIdentity) {
    services.whisperIdentity = readFileSync(file, 'utf8');
  }
  return services.whisperIdentity;
};
export const HANDSHAKE_REQUEST = '0x68616e647368616b6552657175657374';
export const HANDSHAKE_RESPONSE = '0x68616e647368616b65526573706f6e7365';

export const SEARCH_REQUEST = '0x5345415243485f52455155455354';

export const BLOCK_INTERVAL = 100;
