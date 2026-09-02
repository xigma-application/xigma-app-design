// types
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

export const shouldForwardShiftKeyChange = (
  event: KeyboardEvent,
  selectRefs: TSelectionToolRefs,
  lastPointerClientPosition: TPoint | null,
): lastPointerClientPosition is TPoint =>
  event.key === 'Shift' &&
  Boolean(selectRefs.dragStateRef.current || selectRefs.vectorHandleDragRef.current || selectRefs.vectorEraseDragRef.current) &&
  lastPointerClientPosition !== null;
