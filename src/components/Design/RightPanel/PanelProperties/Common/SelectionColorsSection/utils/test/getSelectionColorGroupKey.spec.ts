// types
import { TSelectionColorOccurrence } from '../../types';

// utils
import { getSelectionColorGroupKey } from '../getSelectionColorGroupKey';

describe('getSelectionColorGroupKey', () => {
  it('should build the same key regardless of occurrence order', () => {
    // mock
    const first: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'b', property: 'strokes' },
    ];
    const second: TSelectionColorOccurrence[] = [...first].reverse();

    // result
    expect(getSelectionColorGroupKey(first)).toBe(getSelectionColorGroupKey(second));
  });

  it('should build a different key for a different set of occurrences', () => {
    // mock
    const first: TSelectionColorOccurrence[] = [{ index: 0, nodeId: 'a', property: 'fills' }];
    const second: TSelectionColorOccurrence[] = [{ index: 1, nodeId: 'a', property: 'fills' }];

    // result
    expect(getSelectionColorGroupKey(first)).not.toBe(getSelectionColorGroupKey(second));
  });
});
