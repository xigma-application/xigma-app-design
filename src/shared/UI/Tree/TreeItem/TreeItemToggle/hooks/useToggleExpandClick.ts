import { MouseEvent } from 'react';

export const useToggleExpandClick = (onToggleExpand: TFunc): TFunc<[MouseEvent<HTMLElement>]> => {
  return (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    onToggleExpand();
  };
};
