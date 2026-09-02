import { RefObject, useEffect } from 'react';

// store
import { selectAllGuideLines, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TGuideRefs } from 'types/design/canvas/types';

// utils
import { drawRuler } from '../utils/drawRuler/drawRuler';
import { getHighlightedRulerGuide } from '../utils/getHighlightedRulerGuide';

type TInsetRefs = {
  leftPanelWidthRef: RefObject<number>;
  rightPanelWidthRef: RefObject<number>;
};

const renderFrame = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, insetRefs: TInsetRefs, guides: TGuideRefs): void => {
  const dpr = window.devicePixelRatio || 1;
  const state = store.getState();

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawRuler(ctx, {
    height: canvas.clientHeight,
    highlightedGuide: getHighlightedRulerGuide(guides, selectAllGuideLines(state)),
    leftInset: insetRefs.leftPanelWidthRef.current,
    rightInset: insetRefs.rightPanelWidthRef.current,
    viewport: selectViewport(state),
    width: canvas.clientWidth,
  });
};

export const useRulerRenderLoop = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  insetRefs: TInsetRefs,
  guides: TGuideRefs,
): void => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx && enabled) {
      const frameIdRef = { current: 0 };

      const tick = (): void => {
        renderFrame(canvas, ctx, insetRefs, guides);
        frameIdRef.current = requestAnimationFrame(tick);
      };

      frameIdRef.current = requestAnimationFrame(tick);

      return (): void => cancelAnimationFrame(frameIdRef.current);
    }
  }, [canvasRef, enabled, insetRefs, guides]);
};
