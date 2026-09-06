// types
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

export const shouldForwardModifierKeyChange = (
  event: KeyboardEvent,
  selectRefs: TSelectionToolRefs,
  lastPointerClientPosition: TPoint | null,
): lastPointerClientPosition is TPoint =>
  (event.key === 'Control' || event.key === 'Meta') && Boolean(selectRefs.dragStateRef.current) && lastPointerClientPosition !== null;
