import { PointerEvent as ReactPointerEvent } from 'react';

// hooks
import { TGridTrackSelectModifiers } from '../../hooks/useGridTrackSelection';

export const useBeginTrackHandleDrag = (
  onSelect: TFunc<[TGridTrackSelectModifiers]>,
  onStartDrag: TFunc<[ReactPointerEvent]>,
): TFunc<[ReactPointerEvent]> => {
  return (event: ReactPointerEvent): void => {
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      onSelect({ meta: event.metaKey || event.ctrlKey, shift: event.shiftKey });
      return;
    }

    onStartDrag(event);
  };
};
