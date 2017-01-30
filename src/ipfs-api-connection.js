import ipfsApi from 'ipfs-api';

export default function init () {
  const ipfsApiPath = (process.env.IPFS_API_ADDRESS) ? process.env.IPFS_API_ADDRESS : '/ip4/127.0.0.1/tcp/5001';
  return ipfsApi(ipfsApiPath);
}
