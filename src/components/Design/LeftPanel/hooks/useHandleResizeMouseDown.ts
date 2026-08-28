import { MouseEvent } from 'react';

export const useHandleResizeMouseDown = (onMouseDownX: TFunc<[MouseEvent<HTMLElement>, boolean]>): TFunc<[MouseEvent<HTMLElement>]> => {
  return (event: MouseEvent<HTMLElement>): void => onMouseDownX(event, false);
};
