import { KeyboardEvent, MouseEvent, useState } from 'react';

export type TUseTogglePagesExpandedResult = {
  expand: TFunc;
  handleStopPropagation: TFunc<[MouseEvent<HTMLElement>]>;
  handleToggleClick: TFunc;
  handleToggleKeyDown: TFunc<[KeyboardEvent<HTMLElement>]>;
  isExpanded: boolean;
};

export const useTogglePagesExpanded = (): TUseTogglePagesExpandedResult => {
  const [isExpanded, setIsExpanded] = useState(false);

  const expand = (): void => {
    setIsExpanded(true);
  };

  const handleToggleClick = (): void => {
    setIsExpanded((expanded) => !expanded);
  };

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleClick();
    }
  };

  const handleStopPropagation = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };

  return { expand, handleStopPropagation, handleToggleClick, handleToggleKeyDown, isExpanded };
};
