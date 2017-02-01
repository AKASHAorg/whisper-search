import { join } from 'path';
import SearchIndex from 'search-index';
import { Readable } from 'stream';

export const db = (process.env.SEARCH_DB_PATH)? process.env.SEARCH_DB_PATH: join(__dirname, 'db');
export const source = new Readable({objectMode: true});
const options = { indexPath: db };

export const getIndex = (cb) => {
  SearchIndex(options, function(err, index){
    cb('', index);

    source
      .pipe(index.defaultPipeline())
      .pipe(index.add())
      .on('data', function(d) {
        console.log('added', d);
      })
      .on('end', function() {
        console.log('completed add');
      })
  });
};

