// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

export const resolveVectorMarqueeMode = (
  currentMode: TVectorMarqueeMode | null,
  vertexIds: string[],
  handleHits: TVectorHandleHover[],
  segmentHits: string[],
): TVectorMarqueeMode | null => {
  switch (true) {
    case handleHits.length > 0:
    case currentMode === 'handles':
      return 'handles';
    case currentMode === 'points':
      return 'points';
    case vertexIds.length > 0:
      return 'points';
    case currentMode === 'everything':
      return 'everything';
    case segmentHits.length > 0:
      return 'everything';
    default:
      return currentMode;
  }
};
