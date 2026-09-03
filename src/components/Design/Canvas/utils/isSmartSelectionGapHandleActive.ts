// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isSmartSelectionGapHandleActive = (refs: TCanvasRefs): boolean =>
  Boolean(refs.hover.hoveredSmartSelectionGapRef.current) || Boolean(refs.smartSelection.gapDragRef.current);
