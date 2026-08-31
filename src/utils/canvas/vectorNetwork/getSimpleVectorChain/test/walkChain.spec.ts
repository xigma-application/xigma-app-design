// utils
import { walkChain } from '../walkChain';

describe('walkChain', () => {
  it('should return null when the start vertex has no adjacency entry', () => {
    // result
    expect(walkChain('missing', new Map(), 1)).toBeNull();
  });
});
