import { RefObject, useEffect } from 'react';

// store
import { selectAllGuideLines, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TGuideRefs } from 'types/design/canvas/types';

// utils
import { drawRuler } from '../utils/drawRuler/drawRuler';
import { getHighlightedRulerGuide } from '../utils/getHighlightedRulerGuide';
import { getRulerBands } from '../utils/getRulerBands';

type TInsetRefs = {
  leftPanelWidthRef: RefObject<number>;
  rightPanelWidthRef: RefObject<number>;
};

const renderFrame = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, insetRefs: TInsetRefs, guides: TGuideRefs): void => {
  const dpr = window.devicePixelRatio || 1;
  const state = store.getState();
  const viewport = selectViewport(state);
  const { leftBand, origin, topBand } = getRulerBands(selectSelectedNodes(state), viewport);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawRuler(ctx, {
    height: canvas.clientHeight,
    highlightedGuide: getHighlightedRulerGuide(guides, selectAllGuideLines(state)),
    leftBand,
    leftInset: insetRefs.leftPanelWidthRef.current,
    origin,
    rightInset: insetRefs.rightPanelWidthRef.current,
    topBand,
    viewport,
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
