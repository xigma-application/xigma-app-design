// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getScrollRange } from './getScrollRange';
import { getSelectionBounds } from '../../utils/getSelectionBounds';
import { getVisibleCanvasRect } from '../../utils/getVisibleCanvasRect';

const OVERFLOW_EPSILON_PX = 1;

export type TScrollGeometry = {
  overflow: { x: boolean; y: boolean };
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
  const contentScreen: TDraftRect = {
    height: contentBoundsWorld.height * viewport.zoom,
    width: contentBoundsWorld.width * viewport.zoom,
    x: contentBoundsWorld.x * viewport.zoom + viewport.x,
    y: contentBoundsWorld.y * viewport.zoom + viewport.y,
  };
  const overflow = {
    x:
      contentScreen.x < visibleRect.x - OVERFLOW_EPSILON_PX ||
      contentScreen.x + contentScreen.width > visibleRect.x + visibleRect.width + OVERFLOW_EPSILON_PX,
    y:
      contentScreen.y < visibleRect.y - OVERFLOW_EPSILON_PX ||
      contentScreen.y + contentScreen.height > visibleRect.y + visibleRect.height + OVERFLOW_EPSILON_PX,
  };

  return { overflow, range, visibleRect };
};
