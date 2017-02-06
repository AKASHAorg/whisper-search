import { join } from 'path';
import SearchIndex from 'search-index';

export const db = (process.env.SEARCH_DB_PATH) ? process.env.SEARCH_DB_PATH : join(__dirname, 'db');
const options = { indexPath: db };

export const getIndex = (cb) => {
  SearchIndex(options, function (err, index) {
    cb(err, index);
  });
};


export const consume = (source, index) => {
  source
    .pipe(index.defaultPipeline())
    .pipe(index.add())
    .on('data', function (d) {
      // nothing :D
    })
    .on('end', function () {
      console.log('completed add');
    })
};

