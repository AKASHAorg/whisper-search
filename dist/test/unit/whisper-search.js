'use strict';

var _whisperSearch = require('../../src/whisper-search');

var _whisperSearch2 = _interopRequireDefault(_whisperSearch);

var _indexModel = require('../../src/indexModel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sIndex = void 0;
describe('whisperSearch', function () {
  describe('Greet function', function () {
    beforeEach(function () {
      spy(_whisperSearch2.default, 'greet');
      _whisperSearch2.default.greet();
    });

    it('should have been run once', function () {
      expect(_whisperSearch2.default.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', function () {
      expect(_whisperSearch2.default.greet).to.have.always.returned('hello');
    });

    it('should pipe object to index', function (done) {

      (0, _indexModel.getIndex)(function (err, index) {
        sIndex = index;
        expect(index).to.be.defined;
        done();
      });
    });

    it('should run search query', function (done) {
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
//# sourceMappingURL=whisper-search.js.map