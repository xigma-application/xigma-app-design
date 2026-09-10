import { useState } from 'react';

export type TUseColumnDimensionsFieldRevealParams = {
  onHoverEnd?: TFunc;
  onHoverStart?: TFunc;
};

export type TUseColumnDimensionsFieldRevealResult = {
  isRevealed: boolean;
  onMenuOpenChange: TFunc<[boolean]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
};

export const useColumnDimensionsFieldReveal = ({
  onHoverEnd,
  onHoverStart,
}: TUseColumnDimensionsFieldRevealParams = {}): TUseColumnDimensionsFieldRevealResult => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return {
    isRevealed: isHovered || isMenuOpen,
    onMenuOpenChange: setIsMenuOpen,
    onMouseEnter: (): void => {
      setIsHovered(true);
      onHoverStart?.();
    },
    onMouseLeave: (): void => {
      setIsHovered(false);
      onHoverEnd?.();
    },
  };
};
