import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';

export const commitGridTrackAdd = (controls: TGridAxisControls, isSelfChangeRef: RefObject<boolean>): void => {
  isSelfChangeRef.current = true;
  controls.onAdd();
};
