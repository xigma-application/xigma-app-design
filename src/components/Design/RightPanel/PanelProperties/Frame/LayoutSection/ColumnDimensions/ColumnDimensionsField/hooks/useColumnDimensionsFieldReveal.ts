import { useState } from 'react';

export type TUseColumnDimensionsFieldRevealResult = {
  isRevealed: boolean;
  onMenuOpenChange: TFunc<[boolean]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
};

export const useColumnDimensionsFieldReveal = (): TUseColumnDimensionsFieldRevealResult => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return {
    isRevealed: isHovered || isMenuOpen,
    onMenuOpenChange: setIsMenuOpen,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
};
