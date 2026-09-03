// types
import { TDraftRect } from 'types/canvas';

export const getVisibleCanvasRect = (canvasRect: DOMRect, leftPanelWidth: number, rightPanelWidth: number): TDraftRect => ({
  height: canvasRect.height,
  width: Math.max(canvasRect.width - leftPanelWidth - rightPanelWidth, 0),
  x: leftPanelWidth,
  y: 0,
});
