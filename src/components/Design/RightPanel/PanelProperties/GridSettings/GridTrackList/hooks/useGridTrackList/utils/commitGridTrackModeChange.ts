import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';

// types
import { SizingMode } from 'types/design/enums';

export const commitGridTrackModeChange = (
  controls: TGridAxisControls,
  isSelfChangeRef: RefObject<boolean>,
  index: number,
  mode: SizingMode,
): void => {
  isSelfChangeRef.current = true;
  controls.onChangeMode(index, mode);
};
