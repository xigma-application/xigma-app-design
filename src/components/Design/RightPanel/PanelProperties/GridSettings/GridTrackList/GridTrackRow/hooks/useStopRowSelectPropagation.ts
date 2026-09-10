import { MouseEvent } from 'react';

export const useStopRowSelectPropagation = (): TFunc<[MouseEvent]> => {
  return (event: MouseEvent): void => {
    event.stopPropagation();
  };
};
