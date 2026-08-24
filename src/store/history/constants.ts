// types
import { TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const HISTORY_LIMIT = 100;

export const EMPTY_VECTOR_SELECTION_SNAPSHOT: TVectorSelectionSnapshot = {
  selectedVectorHandles: [],
  selectedVectorSegmentIds: [],
  selectedVectorVertexIds: [],
};
