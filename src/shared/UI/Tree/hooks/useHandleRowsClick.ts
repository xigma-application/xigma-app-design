import { MouseEvent } from 'react';

export const useHandleRowsClick = (onDeselectAll?: TFunc): TFunc<[MouseEvent<HTMLDivElement>]> => {
  return (event: MouseEvent<HTMLDivElement>): void => {
    if (onDeselectAll && event.target === event.currentTarget) {
      onDeselectAll();
    }
  };
};
