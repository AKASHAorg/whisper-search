#! /usr/bin/env node
import runDaemon from '../src/construct-index';
console.log('Initializing indexing service daemon');
runDaemon();
