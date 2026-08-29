import { KeyboardEvent, useState } from 'react';

export type TUseToggleLayersExpandedResult = {
  handleToggleClick: TFunc;
  handleToggleKeyDown: TFunc<[KeyboardEvent<HTMLElement>]>;
  isExpanded: boolean;
};

export const useToggleLayersExpanded = (): TUseToggleLayersExpandedResult => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleClick = (): void => {
    setIsExpanded((expanded) => !expanded);
  };

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleClick();
    }
  };

  return { handleToggleClick, handleToggleKeyDown, isExpanded };
};
