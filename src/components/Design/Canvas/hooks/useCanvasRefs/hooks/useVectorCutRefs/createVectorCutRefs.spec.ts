// hooks
import { createVectorCutRefs } from './createVectorCutRefs';

describe('createVectorCutRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorCutRefs();

    // result
    expect(refs).toEqual({
      newVectorCutVertexIdsRef: { current: new Set() },
      touchedVectorCutVertexIdsRef: { current: new Set() },
      vectorCutPreviewRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const vectorCutPreviewRef = { current: { crossings: [], lineEnd: { x: 1, y: 1 }, lineStart: { x: 0, y: 0 } } };

    // before
    const refs = createVectorCutRefs({ vectorCutPreviewRef });

    // result
    expect(refs.vectorCutPreviewRef).toBe(vectorCutPreviewRef);
  });
});
