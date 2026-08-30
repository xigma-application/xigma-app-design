import { MouseEvent } from 'react';

// types
import { TToggleExpand } from '../../../types';

export const useToggleExpandClick = (onToggleExpand: TToggleExpand): TFunc<[MouseEvent<HTMLElement>]> => {
  return (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    onToggleExpand({ recursive: event.ctrlKey || event.metaKey });
  };
};
