// hooks
import { createVectorSnapshotsRefs } from './createVectorSnapshotsRefs';

describe('createVectorSnapshotsRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorSnapshotsRefs();

    // result
    expect(refs).toEqual({
      draggedVectorFillFacesRef: { current: null },
      draggedVectorNodeSnapshotsRef: { current: null },
      resizedVectorNodeSnapshotsRef: { current: null },
      rotatedVectorNodeSnapshotsRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const draggedVectorNodeSnapshotsRef = { current: new Map() };

    // before
    const refs = createVectorSnapshotsRefs({ draggedVectorNodeSnapshotsRef });

    // result
    expect(refs.draggedVectorNodeSnapshotsRef).toBe(draggedVectorNodeSnapshotsRef);
    expect(refs.draggedVectorFillFacesRef).toEqual({ current: null });
  });
});
