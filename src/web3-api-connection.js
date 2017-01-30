import Web3 from 'web3';
import net from 'net';

export default function init () {
  const web3 = new Web3();
  const socket = new net.Socket();
  const ipcPath = process.env.GETH_IPC_PATH;

  socket.setTimeout(0);
  socket.setEncoding('utf8');
  web3.setProvider(new Web3.providers.IpcProvider(ipcPath, socket));

  return web3;
}
