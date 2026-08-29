// utils
import { getRangeSelectionIds } from '../getRangeSelectionIds';

describe('getRangeSelectionIds', () => {
  it('should return the ascending range from anchor to target, inclusive', () => {
    // action & result
    expect(getRangeSelectionIds(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['a', 'b', 'c']);
  });

  it('should return the same ids regardless of anchor/target order, following list order', () => {
    // action & result
    expect(getRangeSelectionIds(['a', 'b', 'c', 'd'], 'c', 'a')).toEqual(['a', 'b', 'c']);
  });

  it('should return a single-id range when the anchor and target are the same id', () => {
    // action & result
    expect(getRangeSelectionIds(['a', 'b', 'c'], 'b', 'b')).toEqual(['b']);
  });

  it('should fall back to just the target id when the anchor is not found in the ordered ids', () => {
    // action & result
    expect(getRangeSelectionIds(['a', 'b', 'c'], 'missing', 'b')).toEqual(['b']);
  });

  it('should fall back to just the target id when the target is not found in the ordered ids', () => {
    // action & result
    expect(getRangeSelectionIds(['a', 'b', 'c'], 'a', 'missing')).toEqual(['missing']);
  });
});
