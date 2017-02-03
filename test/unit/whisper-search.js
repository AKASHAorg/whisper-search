import whisperSearch from '../../src/whisper-search';
import { getIndex } from '../../src/indexModel';

let sIndex;
describe('whisperSearch', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(whisperSearch, 'greet');
      whisperSearch.greet();
    });

    it('should have been run once', () => {
      expect(whisperSearch.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(whisperSearch.greet).to.have.always.returned('hello');
    });

    it('should pipe object to index', (done) => {

      getIndex((err, index) => {
        sIndex = index;
        expect(index).to.be.defined;
        done();
      });
    });

    it('should run search query', (done) => {
      sIndex.search({ query: { AND: { entryId: ['711'] } } }).on('data', function (doc) {
        console.log(doc);
        expect(doc.document).to.be.defined;
      }).on('end', function () {
        console.log('found?');
        done();
      });
    });
  });
});
