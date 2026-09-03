// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getScrollRange } from './getScrollRange';
import { getSelectionBounds } from '../../utils/getSelectionBounds';
import { getVisibleCanvasRect } from '../../utils/getVisibleCanvasRect';

export type TScrollGeometry = {
  range: TDraftRect;
  visibleRect: TDraftRect;
};

const getContentBoundsWorld = (nodes: TSceneNode[], viewport: TViewport, visibleRect: TDraftRect): TDraftRect => {
  if (nodes.length > 0) {
    return getSelectionBounds(nodes);
  }

  return {
    height: visibleRect.height / viewport.zoom,
    width: visibleRect.width / viewport.zoom,
    x: (visibleRect.x - viewport.x) / viewport.zoom,
    y: (visibleRect.y - viewport.y) / viewport.zoom,
  };
};

export const getScrollGeometry = (
  canvasRect: DOMRect,
  leftPanelWidth: number,
  rightPanelWidth: number,
  nodes: TSceneNode[],
  viewport: TViewport,
): TScrollGeometry => {
  const visibleRect = getVisibleCanvasRect(canvasRect, leftPanelWidth, rightPanelWidth);
  const contentBoundsWorld = getContentBoundsWorld(nodes, viewport, visibleRect);
  const range = getScrollRange(contentBoundsWorld, viewport, visibleRect);

  return { range, visibleRect };
};
