// hooks
import { createVectorMultiSelectRefs } from './createVectorMultiSelectRefs';

describe('createVectorMultiSelectRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorMultiSelectRefs();

    // result
    expect(refs).toEqual({
      vectorMultiDragRef: { current: null },
      vectorMultiSelectBoxRef: { current: null },
      vectorMultiSelectResizeDragRef: { current: null },
      vectorMultiSelectRotateDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const vectorMultiSelectBoxRef = { current: { bounds: { height: 1, width: 1, x: 0, y: 0 }, rotation: 0, selectionKey: 'k' } };

    // before
    const refs = createVectorMultiSelectRefs({ vectorMultiSelectBoxRef });

    // result
    expect(refs.vectorMultiSelectBoxRef).toBe(vectorMultiSelectBoxRef);
    expect(refs.vectorMultiDragRef).toEqual({ current: null });
  });
});
