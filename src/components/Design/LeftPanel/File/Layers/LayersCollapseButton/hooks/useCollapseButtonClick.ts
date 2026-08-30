import { MouseEvent } from 'react';

export const useCollapseButtonClick =
  (onCollapseAll: TFunc): TFunc<[MouseEvent<HTMLButtonElement>]> =>
  (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onCollapseAll();
  };
