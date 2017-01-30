import levelup from 'levelup';
import { join } from 'path';
import SearchIndex from 'search-index';
import { Readable } from 'stream';

export const db = levelup(join(__dirname, 'db'));
export const source = new Readable({objectMode: true});
const options = { db: db };

export const getIndex = (cb) => {
  SearchIndex(options, function(err, index){
    cb('', index);

    source
      .pipe(index.defaultPipeline())
      .pipe(index.add())
      .on('data', function(d) {
        console.log(d, 'what is dis O_O');
      })
      .on('end', function() {
        console.log('completed')
      })
  });
};

