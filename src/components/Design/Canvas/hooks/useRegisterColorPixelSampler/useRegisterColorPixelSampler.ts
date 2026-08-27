import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TRgba } from 'types/color';

// utils
import { COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE } from 'utils/canvas/colorPixelSampler/constants';
import { registerColorPixelSampler } from 'utils/canvas/colorPixelSampler/colorPixelSamplerRegistry';

const isPointOverCanvas = (canvas: HTMLCanvasElement, x: number, y: number): boolean => {
  const passthroughElements = Array.from(document.querySelectorAll<HTMLElement>(`[${COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE}]`));
  const previousBodyPointerEvents = document.body.style.pointerEvents;
  const previousPassthroughPointerEvents = passthroughElements.map((element) => element.style.pointerEvents);

  document.body.style.pointerEvents = 'auto';
  passthroughElements.forEach((element) => {
    element.style.pointerEvents = 'none';
  });

  const isOverCanvas = document.elementFromPoint(x, y) === canvas;

  document.body.style.pointerEvents = previousBodyPointerEvents;
  passthroughElements.forEach((element, index) => {
    element.style.pointerEvents = previousPassthroughPointerEvents[index];
  });

  return isOverCanvas;
};

export const useRegisterColorPixelSampler = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const sampleColor = (x: number, y: number): Promise<TRgba[] | null> =>
      new Promise((resolve) => {
        const canvas = refs.canvasRef.current;

        if (canvas && isPointOverCanvas(canvas, x, y)) {
          refs.colorSampleRequestRef.current = { onSample: resolve, x, y };
        } else {
          resolve(null);
        }
      });

    return registerColorPixelSampler(sampleColor);
  }, [refs]);
};
