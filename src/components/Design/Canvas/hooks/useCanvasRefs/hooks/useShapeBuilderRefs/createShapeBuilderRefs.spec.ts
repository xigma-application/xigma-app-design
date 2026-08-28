// hooks
import { createShapeBuilderRefs } from './createShapeBuilderRefs';

describe('createShapeBuilderRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createShapeBuilderRefs();

    // result
    expect(refs).toEqual({
      isVectorShapeBuilderBoxModeRef: { current: false },
      isVectorShapeBuilderSubtractRef: { current: false },
      touchedVectorShapeBuilderFacesRef: { current: {} },
      vectorShapeBuilderPathRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const vectorShapeBuilderPathRef = { current: [{ x: 1, y: 2 }] };

    // before
    const refs = createShapeBuilderRefs({ vectorShapeBuilderPathRef });

    // result
    expect(refs.vectorShapeBuilderPathRef).toBe(vectorShapeBuilderPathRef);
    expect(refs.isVectorShapeBuilderBoxModeRef).toEqual({ current: false });
  });
});
