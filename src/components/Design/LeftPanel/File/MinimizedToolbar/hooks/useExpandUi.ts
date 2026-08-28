import { KeyboardEvent } from 'react';

// hooks
import { useToggleUiMinimized } from '../../Header/MinimizeUiButton/hooks/useToggleUiMinimized';

export type TUseExpandUiResult = {
  handleClick: TFunc;
  handleKeyDown: TFunc<[KeyboardEvent<HTMLElement>]>;
};

export const useExpandUi = (): TUseExpandUiResult => {
  const handleClick = useToggleUiMinimized();

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return { handleClick, handleKeyDown };
};
