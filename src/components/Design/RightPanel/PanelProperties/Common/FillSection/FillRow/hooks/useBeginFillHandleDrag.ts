import { PointerEvent as ReactPointerEvent } from 'react';

// hooks
import { TFillSelectModifiers } from '../../hooks/useFillSection/hooks/useFillSelection/useFillSelection';

export const useBeginFillHandleDrag = (
  onSelect: TFunc<[TFillSelectModifiers]>,
  onStartDrag: TFunc<[ReactPointerEvent]>,
): TFunc<[ReactPointerEvent]> => {
  return (event: ReactPointerEvent): void => {
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      onSelect({ meta: event.metaKey || event.ctrlKey, shift: event.shiftKey });
    } else {
      onStartDrag(event);
    }
  };
};
