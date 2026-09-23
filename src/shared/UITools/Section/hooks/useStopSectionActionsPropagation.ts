import { MouseEvent } from 'react';

export const useStopSectionActionsPropagation = (): TFunc<[MouseEvent<HTMLElement>]> => {
  return (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };
};
