import web3 from './web3-api-connection';
import ipfs from './ipfs-api-connection';

const services  = {
  web3: null,
  ipfs: null,
  whisperIdentity: null
};

export const getWeb3 = () =>{
  if(!services.web3){
    services.web3 = web3();
  }
  return services.web3;
};

export const getIpfs = () => {
  if(!services.ipfs){
    services.ipfs = ipfs();
  }
  return services.ipfs;
};

export const setIdentity = (newIdentity) => {
  services.whisperIdentity = newIdentity;
};

export const getIdentity = () => {
  return services.whisperIdentity;
};
export const HANDSHAKE_REQUEST = '0x68616e647368616b6552657175657374';
export const HANDSHAKE_RESPONSE = '0x68616e647368616b65526573706f6e7365';
