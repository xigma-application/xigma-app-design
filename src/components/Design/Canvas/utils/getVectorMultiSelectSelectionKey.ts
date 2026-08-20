// types
import { TVectorHandleHover } from 'types/design/canvas/types';

export const getVectorMultiSelectSelectionKey = (selectedVertexIds: string[], selectedHandles: TVectorHandleHover[]): string =>
  [...[...selectedVertexIds].sort(), ...selectedHandles.map((handle) => `${handle.end}:${handle.segmentId}`).sort()].join(',');
