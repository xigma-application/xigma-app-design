import { MouseEvent } from 'react';

export const useStopCropMouseDownPropagation = (): TFunc<[MouseEvent]> => {
  return (event: MouseEvent): void => {
    event.stopPropagation();
  };
};
