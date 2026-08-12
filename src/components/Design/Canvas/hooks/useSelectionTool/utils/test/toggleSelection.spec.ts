// utils
import { toggleSelection } from '../toggleSelection';

describe('toggleSelection', () => {
  it('should add an id that is not yet selected', () => {
    // result
    expect(toggleSelection(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('should remove an id that is already selected', () => {
    // result
    expect(toggleSelection(['a', 'b'], 'b')).toEqual(['a']);
  });

  it('should add to an empty selection', () => {
    // result
    expect(toggleSelection([], 'a')).toEqual(['a']);
  });
});
