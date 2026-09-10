import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';

export const commitGridTrackValueChange = (
  controls: TGridAxisControls,
  isSelfChangeRef: RefObject<boolean>,
  index: number,
  value: number,
): void => {
  isSelfChangeRef.current = true;
  controls.onChangeValue(index, value);
};
