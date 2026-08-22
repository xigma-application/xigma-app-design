// utils
import { retargetVertexId } from '../retargetVertexId';

describe('retargetVertexId', () => {
  it('should replace the target vertex id with the source vertex id', () => {
    expect(retargetVertexId('target', 'source', 'target')).toBe('source');
  });

  it('should leave any other id untouched', () => {
    expect(retargetVertexId('other', 'source', 'target')).toBe('other');
  });
});
