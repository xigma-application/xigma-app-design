import { MouseEvent } from 'react';

export const useHandleTrackValueClick = (isFill: boolean, selectNumberPortion: TFunc): TFunc<[MouseEvent<HTMLInputElement>]> => {
  return (event: MouseEvent<HTMLInputElement>): void => {
    event.stopPropagation();

    if (isFill) {
      selectNumberPortion();
    }
  };
};
