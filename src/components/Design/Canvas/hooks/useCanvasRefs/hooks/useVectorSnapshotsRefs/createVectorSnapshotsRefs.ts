// types
import { TVectorSnapshotsRefs } from 'types/design/canvas/types';

export const createVectorSnapshotsRefs = (overrides: Partial<TVectorSnapshotsRefs> = {}): TVectorSnapshotsRefs => ({
  draggedVectorFillFacesRef: { current: null },
  draggedVectorNodeSnapshotsRef: { current: null },
  resizedVectorNodeSnapshotsRef: { current: null },
  rotatedVectorNodeSnapshotsRef: { current: null },
  ...overrides,
});
