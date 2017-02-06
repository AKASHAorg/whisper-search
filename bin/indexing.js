#! /usr/bin/env node
import runDaemon from '../src/construct-index';
console.log('Initializing indexing service daemon');
const daemon = new runDaemon({objectMode: true});
if(process.env.PUMP_INDEX){
  daemon.pump();
}
setTimeout(
  ()=> {
  daemon.daemonize();
  daemon.enableSearch();
}, 10000);
