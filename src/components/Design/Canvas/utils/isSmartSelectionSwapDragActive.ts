// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isSmartSelectionSwapDragActive = (refs: TCanvasRefs): boolean => Boolean(refs.smartSelection.swapDragRef.current);
