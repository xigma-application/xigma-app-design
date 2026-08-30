import { useState } from 'react';

export type TUseLayersHoverResult = {
  isHovered: boolean;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
};

export const useLayersHover = (): TUseLayersHoverResult => {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = (): void => setIsHovered(true);
  const onMouseLeave = (): void => setIsHovered(false);

  return { isHovered, onMouseEnter, onMouseLeave };
};
