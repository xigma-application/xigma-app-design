// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { isPartOfVectorMultiSelection } from '../isPartOfVectorMultiSelection';

const refs = (vertices: string[], handles: unknown[], segments: string[]): TCanvasRefs =>
  ({
    vectorEdit: {
      selectedVectorHandlesRef: { current: handles },
      selectedVectorSegmentIdsRef: { current: segments },
      selectedVectorVertexIdsRef: { current: vertices },
    },
  }) as unknown as TCanvasRefs;

describe('isPartOfVectorMultiSelection', () => {
  it('should be true for a selected item when more than one thing is selected', () => {
    // result
    expect(isPartOfVectorMultiSelection(refs(['a'], [{}], []), true)).toBe(true);
    expect(isPartOfVectorMultiSelection(refs([], [], ['s1', 's2']), true)).toBe(true);
  });

  it('should be false for an unselected item or a single selection', () => {
    // result
    expect(isPartOfVectorMultiSelection(refs(['a', 'b'], [], []), false)).toBe(false);
    expect(isPartOfVectorMultiSelection(refs(['a'], [], []), true)).toBe(false);
  });
});
