// types
import { TDraftRect } from 'types/canvas';
import { TLayoutRefs } from 'types/design/canvas/types';

export const getVisibleCanvasRect = (canvasRect: DOMRect, layout: TLayoutRefs): TDraftRect => {
  const leftPanelWidth = layout.leftPanelWidthRef.current;
  const rightPanelWidth = layout.rightPanelWidthRef.current;

  return {
    height: canvasRect.height,
    width: Math.max(canvasRect.width - leftPanelWidth - rightPanelWidth, 0),
    x: leftPanelWidth,
    y: 0,
  };
};
