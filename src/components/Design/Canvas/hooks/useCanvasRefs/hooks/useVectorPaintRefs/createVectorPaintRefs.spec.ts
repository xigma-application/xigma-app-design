// hooks
import { createVectorPaintRefs } from './createVectorPaintRefs';

describe('createVectorPaintRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorPaintRefs();

    // result
    expect(refs).toEqual({
      isVectorPaintRemoveRef: { current: false },
      touchedVectorPaintLoopKeysRef: { current: {} },
      vectorPaintPathRef: { current: null },
      vectorPaintTouchedFacesRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const vectorPaintPathRef = { current: [{ x: 1, y: 2 }] };

    // before
    const refs = createVectorPaintRefs({ vectorPaintPathRef });

    // result
    expect(refs.vectorPaintPathRef).toBe(vectorPaintPathRef);
    expect(refs.isVectorPaintRemoveRef).toEqual({ current: false });
  });
});
