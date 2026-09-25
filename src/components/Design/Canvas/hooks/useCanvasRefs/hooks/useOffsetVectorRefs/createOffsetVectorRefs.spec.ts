// hooks
import { createOffsetVectorRefs } from './createOffsetVectorRefs';

describe('createOffsetVectorRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createOffsetVectorRefs();

    // result
    expect(refs).toEqual({ hoveredOffsetVectorEdgeRef: { current: null }, offsetVectorDragRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const offsetVectorDragRef = { current: null };

    // before
    const refs = createOffsetVectorRefs({ offsetVectorDragRef });

    // result
    expect(refs.offsetVectorDragRef).toBe(offsetVectorDragRef);
  });
});
