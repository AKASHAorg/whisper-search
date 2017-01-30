import whisperSearch from '../../src/whisper-search';

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
  });
});
