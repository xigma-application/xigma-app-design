import { RefObject, useEffect } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { drawRuler } from '../utils/drawRuler';

type TInsetRefs = {
  leftPanelWidthRef: RefObject<number>;
  rightPanelWidthRef: RefObject<number>;
};

const renderFrame = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, insetRefs: TInsetRefs): void => {
  const dpr = window.devicePixelRatio || 1;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawRuler(ctx, {
    height: canvas.clientHeight,
    leftInset: insetRefs.leftPanelWidthRef.current,
    rightInset: insetRefs.rightPanelWidthRef.current,
    viewport: selectViewport(store.getState()),
    width: canvas.clientWidth,
  });
};

export const useRulerRenderLoop = (canvasRef: RefObject<HTMLCanvasElement | null>, enabled: boolean, insetRefs: TInsetRefs): void => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx && enabled) {
      const frameIdRef = { current: 0 };

      const tick = (): void => {
        renderFrame(canvas, ctx, insetRefs);
        frameIdRef.current = requestAnimationFrame(tick);
      };

      frameIdRef.current = requestAnimationFrame(tick);

      return (): void => cancelAnimationFrame(frameIdRef.current);
    }
  }, [canvasRef, enabled, insetRefs]);
};
