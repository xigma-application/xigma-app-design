import { MouseEvent } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useDeselectOnEmptyClick = (): TFunc<[MouseEvent<HTMLElement>]> => {
  const dispatch = useAppDispatch();

  return (event: MouseEvent<HTMLElement>): void => {
    if (event.target === event.currentTarget) {
      dispatch(setSelection([]));
    }
  };
};
