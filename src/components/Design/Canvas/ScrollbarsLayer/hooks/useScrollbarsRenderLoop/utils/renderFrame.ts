// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TLayoutRefs } from 'types/design/canvas/types';
import { TFrozenRangeRefs, TScrollbarDragRefs, TScrollbarElementRefs } from '../../../types';

// utils
import { getScrollbarThumb } from '../../../utils/getScrollbarThumb';
import { getScrollGeometry } from '../../../utils/getScrollGeometry';

const px = (value: number): string => `${value}px`;

export const renderFrame = (
  canvas: HTMLCanvasElement,
  layout: TLayoutRefs,
  elements: TScrollbarElementRefs,
  dragging: TScrollbarDragRefs,
  frozenRange: TFrozenRangeRefs,
): void => {
  const { horizontalThumbRef, horizontalTrackRef, verticalThumbRef, verticalTrackRef } = elements;
  const horizontalTrack = horizontalTrackRef.current;
  const horizontalThumb = horizontalThumbRef.current;
  const verticalTrack = verticalTrackRef.current;
  const verticalThumb = verticalThumbRef.current;

  if (horizontalTrack && horizontalThumb && verticalTrack && verticalThumb) {
    const state = store.getState();
    const { overflow, range, visibleRect } = getScrollGeometry(
      canvas.getBoundingClientRect(),
      layout,
      selectOrderedNodes(state),
      selectViewport(state),
    );
    const horizontalRangeLength = frozenRange.x.current?.rangeLength ?? range.width;
    const verticalRangeLength = frozenRange.y.current?.rangeLength ?? range.height;
    const horizontal = getScrollbarThumb(visibleRect.width, visibleRect.x, visibleRect.width, range.x, horizontalRangeLength);
    const vertical = getScrollbarThumb(visibleRect.height, visibleRect.y, visibleRect.height, range.y, verticalRangeLength);

    horizontalTrack.style.display = overflow.x || dragging.x.current ? '' : 'none';
    horizontalTrack.style.left = px(visibleRect.x);
    horizontalTrack.style.width = px(visibleRect.width);
    horizontalThumb.style.left = px(horizontal.offset);
    horizontalThumb.style.width = px(horizontal.size);

    verticalTrack.style.display = overflow.y || dragging.y.current ? '' : 'none';
    verticalTrack.style.right = px(layout.rightPanelWidthRef.current);
    verticalTrack.style.top = px(visibleRect.y);
    verticalTrack.style.height = px(visibleRect.height);
    verticalThumb.style.top = px(vertical.offset);
    verticalThumb.style.height = px(vertical.size);
  }
};
