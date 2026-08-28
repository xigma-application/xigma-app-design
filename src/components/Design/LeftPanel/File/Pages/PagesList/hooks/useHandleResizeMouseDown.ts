import { MouseEvent } from 'react';

export const useHandleResizeMouseDown =
  (onMouseDownY: TFunc<[MouseEvent<HTMLElement>, boolean]>): TFunc<[MouseEvent<HTMLElement>]> =>
  (event: MouseEvent<HTMLElement>): void =>
    onMouseDownY(event, false);
