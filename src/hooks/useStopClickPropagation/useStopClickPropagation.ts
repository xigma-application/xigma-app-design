import { MouseEvent } from 'react';

export const useStopClickPropagation =
  (): TFunc<[MouseEvent]> =>
  (event: MouseEvent): void => {
    event.stopPropagation();
  };
