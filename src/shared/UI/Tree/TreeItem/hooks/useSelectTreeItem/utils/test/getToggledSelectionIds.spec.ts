// utils
import { getToggledSelectionIds } from '../getToggledSelectionIds';

describe('getToggledSelectionIds', () => {
  it('should append the id when it is not already selected', () => {
    // action & result
    expect(getToggledSelectionIds(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  it('should remove the id when it is already selected', () => {
    // action & result
    expect(getToggledSelectionIds(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });

  it('should add to an empty selection', () => {
    // action & result
    expect(getToggledSelectionIds([], 'a')).toEqual(['a']);
  });
});
