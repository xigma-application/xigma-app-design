import { MouseEvent } from 'react';

export const useStopFillRowSelectPropagation = (): TFunc<[MouseEvent]> => {
  return (event: MouseEvent): void => {
    event.stopPropagation();
  };
};
