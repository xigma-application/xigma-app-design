// utils
import { resolveExpandedIdsControl } from '../resolveExpandedIdsControl';

describe('resolveExpandedIdsControl', () => {
  it('should pair the set with the change handler when both are provided', () => {
    // mock
    const expandedIds = new Set(['a']);
    const onExpandedIdsChange = vi.fn();

    // result
    expect(resolveExpandedIdsControl(expandedIds, onExpandedIdsChange)).toEqual({ expandedIds, onExpandedIdsChange });
  });

  it('should return undefined when the set is missing', () => {
    expect(resolveExpandedIdsControl(undefined, vi.fn())).toBeUndefined();
  });

  it('should return undefined when the change handler is missing', () => {
    expect(resolveExpandedIdsControl(new Set(), undefined)).toBeUndefined();
  });

  it('should return undefined when both are missing', () => {
    expect(resolveExpandedIdsControl(undefined, undefined)).toBeUndefined();
  });
});
