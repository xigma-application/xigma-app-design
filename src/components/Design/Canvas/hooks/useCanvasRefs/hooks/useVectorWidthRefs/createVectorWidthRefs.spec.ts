// hooks
import { createVectorWidthRefs } from './createVectorWidthRefs';

describe('createVectorWidthRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorWidthRefs();

    // result
    expect(refs).toEqual({
      vectorWidthPointDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const vectorWidthPointDragRef = { current: null };

    // before
    const refs = createVectorWidthRefs({ vectorWidthPointDragRef });

    // result
    expect(refs.vectorWidthPointDragRef).toBe(vectorWidthPointDragRef);
  });
});
