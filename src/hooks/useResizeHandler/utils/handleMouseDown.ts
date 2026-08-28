import { MouseEvent } from 'react';

// types
import { MouseButton } from 'types/enums';

export const handleMouseDown = (
  event: MouseEvent<HTMLElement>,
  isInverted: boolean,
  setIsInverted: TFunc<[boolean]>,
  setIsPressing: TFunc<[boolean]>,
): void => {
  if (event.button === MouseButton.primary) {
    setIsInverted(isInverted);
    setIsPressing(true);
  }
};
