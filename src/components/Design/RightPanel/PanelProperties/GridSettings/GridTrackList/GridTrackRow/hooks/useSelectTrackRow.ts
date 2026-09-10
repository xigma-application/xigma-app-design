import { MouseEvent } from 'react';

// hooks
import { TGridTrackSelectModifiers } from '../../hooks/useGridTrackSelection';

export const useSelectTrackRow = (onSelect: TFunc<[TGridTrackSelectModifiers]>): TFunc<[MouseEvent<HTMLDivElement>]> => {
  return (event: MouseEvent<HTMLDivElement>): void => {
    onSelect({ meta: event.metaKey || event.ctrlKey, shift: event.shiftKey });
  };
};
