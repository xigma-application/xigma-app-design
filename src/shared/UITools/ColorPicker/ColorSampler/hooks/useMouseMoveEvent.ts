import { throttle } from 'lodash';
import { useEffect } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TRgba } from 'types/color';

// utils
import { sampleColorPixels } from 'utils/canvas/colorPixelSampler/colorPixelSamplerRegistry';

const MOUSE_MOVE_THROTTLE_MS = 20;

export const useMouseMoveEvent = (setColors: TFunc<[TRgba[] | null]>, setMousePosition: TFunc<[TPoint]>): void => {
  useEffect(() => {
    const handleMouseMove = throttle((event: MouseEvent): void => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      void sampleColorPixels(event.clientX, event.clientY).then(setColors);
    }, MOUSE_MOVE_THROTTLE_MS);

    window.addEventListener('mousemove', handleMouseMove);

    return (): void => window.removeEventListener('mousemove', handleMouseMove);
  }, [setColors, setMousePosition]);
};
