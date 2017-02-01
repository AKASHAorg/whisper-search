import whisperSearch from '../../src/whisper-search';
import { getIndex, source } from '../../src/indexModel';

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
      });
      for (let i = 0; i < 10; i++) {
        source.push({ a: i });
      }
      source.push(null);
      setTimeout(done, 1500);
    });

    it('should run search query', (done) => {
      sIndex.search({ query: { AND: { a: ['9'] } } }).on('data', function (doc) {
        expect(doc.document).to.eql({ a: 9 });
      }).on('end', function () {
        console.log('found?');
        done();
      });
    });
  });
});
