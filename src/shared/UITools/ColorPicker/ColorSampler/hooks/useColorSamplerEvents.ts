import { useState } from 'react';

// hooks
import { useHandleInitial } from './useHandleInitial';
import { useMouseMoveEvent } from './useMouseMoveEvent';

// types
import { TPoint } from 'types/canvas';
import { TRgba } from 'types/color';

export type TUseColorSamplerEventsResult = {
  colors: TRgba[] | null;
  mousePosition: TPoint | null;
};

export const useColorSamplerEvents = (): TUseColorSamplerEventsResult => {
  const [colors, setColors] = useState<TRgba[] | null>(null);
  const [mousePosition, setMousePosition] = useState<TPoint | null>(null);

  useHandleInitial();
  useMouseMoveEvent(setColors, setMousePosition);

  return { colors, mousePosition };
};
