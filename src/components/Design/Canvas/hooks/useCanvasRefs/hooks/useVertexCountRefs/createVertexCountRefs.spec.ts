// hooks
import { createVertexCountRefs } from './createVertexCountRefs';

describe('createVertexCountRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVertexCountRefs();

    // result
    expect(refs).toEqual({
      polygonVertexCountDragRef: { current: null },
      starVertexCountDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const polygonVertexCountDragRef = { current: null };

    // before
    const refs = createVertexCountRefs({ polygonVertexCountDragRef });

    // result
    expect(refs.polygonVertexCountDragRef).toBe(polygonVertexCountDragRef);
    expect(refs.starVertexCountDragRef).toEqual({ current: null });
  });
});
