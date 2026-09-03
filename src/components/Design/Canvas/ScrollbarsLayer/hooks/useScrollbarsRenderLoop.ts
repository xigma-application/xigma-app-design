import { RefObject, useEffect } from 'react';

// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TLayoutRefs } from 'types/design/canvas/types';
import { TScrollbarElementRefs } from '../types';

// utils
import { getScrollbarThumb } from '../utils/getScrollbarThumb';
import { getScrollGeometry } from '../utils/getScrollGeometry';

const px = (value: number): string => `${value}px`;

const renderFrame = (canvas: HTMLCanvasElement, layout: TLayoutRefs, elements: TScrollbarElementRefs): void => {
  const { horizontalThumbRef, horizontalTrackRef, verticalThumbRef, verticalTrackRef } = elements;
  const horizontalTrack = horizontalTrackRef.current;
  const horizontalThumb = horizontalThumbRef.current;
  const verticalTrack = verticalTrackRef.current;
  const verticalThumb = verticalThumbRef.current;

  if (horizontalTrack && horizontalThumb && verticalTrack && verticalThumb) {
    const state = store.getState();
    const { overflow, range, visibleRect } = getScrollGeometry(
      canvas.getBoundingClientRect(),
      layout.leftPanelWidthRef.current,
      layout.rightPanelWidthRef.current,
      selectOrderedNodes(state),
      selectViewport(state),
    );
    const horizontal = getScrollbarThumb(visibleRect.width, visibleRect.x, visibleRect.width, range.x, range.width);
    const vertical = getScrollbarThumb(visibleRect.height, visibleRect.y, visibleRect.height, range.y, range.height);

    horizontalTrack.style.display = overflow.x ? '' : 'none';
    horizontalTrack.style.left = px(visibleRect.x);
    horizontalTrack.style.width = px(visibleRect.width);
    horizontalThumb.style.left = px(horizontal.offset);
    horizontalThumb.style.width = px(horizontal.size);

    verticalTrack.style.display = overflow.y ? '' : 'none';
    verticalTrack.style.right = px(layout.rightPanelWidthRef.current);
    verticalTrack.style.top = px(visibleRect.y);
    verticalTrack.style.height = px(visibleRect.height);
    verticalThumb.style.top = px(vertical.offset);
    verticalThumb.style.height = px(vertical.size);
  }
};

export const useScrollbarsRenderLoop = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  layout: TLayoutRefs,
  elements: TScrollbarElementRefs,
): void => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const frameIdRef = { current: 0 };

      const tick = (): void => {
        renderFrame(canvas, layout, elements);
        frameIdRef.current = requestAnimationFrame(tick);
      };

      frameIdRef.current = requestAnimationFrame(tick);

      return (): void => cancelAnimationFrame(frameIdRef.current);
    }
  }, [canvasRef, elements, layout]);
};
