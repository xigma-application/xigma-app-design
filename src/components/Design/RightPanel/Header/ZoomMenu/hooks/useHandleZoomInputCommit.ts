import { Dispatch, KeyboardEvent, SetStateAction } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// others
import { ZOOM_MAX, ZOOM_MIN } from 'components/Design/Canvas/constants';

// store
import { useAppDispatch } from 'store';

// types
import { KeyboardKeys } from 'types/enums';

// utils
import { clamp } from 'utils/math/clamp';
import { handleZoomToPercentage } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleZoomToPercentage';

export const useHandleZoomInputCommit = (
  setValue: Dispatch<SetStateAction<string>>,
): ((event: KeyboardEvent<HTMLInputElement>) => void) => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === KeyboardKeys.enter) {
      const parsed = clamp(Number(event.currentTarget.value) || 0, ZOOM_MIN * 100, ZOOM_MAX * 100);

      setValue(String(parsed));
      handleZoomToPercentage(dispatch, refs, parsed / 100);
      event.currentTarget.blur();
    }
  };
};
