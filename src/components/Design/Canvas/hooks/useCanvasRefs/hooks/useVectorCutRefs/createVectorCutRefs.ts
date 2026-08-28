// types
import { TVectorCutRefs } from 'types/design/canvas/types';

export const createVectorCutRefs = (overrides: Partial<TVectorCutRefs> = {}): TVectorCutRefs => ({
  newVectorCutVertexIdsRef: { current: new Set() },
  touchedVectorCutVertexIdsRef: { current: new Set() },
  vectorCutPreviewRef: { current: null },
  ...overrides,
});
