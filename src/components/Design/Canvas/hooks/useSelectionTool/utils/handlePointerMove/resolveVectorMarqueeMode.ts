// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

export const resolveVectorMarqueeMode = (
  currentMode: TVectorMarqueeMode | null,
  vertexIds: string[],
  handleHits: TVectorHandleHover[],
  segmentHits: string[],
): TVectorMarqueeMode | null => {
  if (currentMode) {
    return currentMode;
  }

  if (vertexIds.length > 0) {
    return 'points';
  }

  if (handleHits.length > 0 || segmentHits.length > 0) {
    return 'everything';
  }

  return null;
};
