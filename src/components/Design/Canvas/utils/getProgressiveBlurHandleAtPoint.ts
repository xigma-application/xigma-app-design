// types
import { TOpenPropertyPanel } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TProgressiveBlurEndpoint } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getOpenProgressiveBlur } from './getOpenProgressiveBlur';
import { getProgressiveBlurWorldPoints } from './getProgressiveBlurWorldPoints';

export const PROGRESSIVE_BLUR_HANDLE_RADIUS_PX = 6;

export type TProgressiveBlurHandleHit = {
  effectIndex: number;
  endpoint: TProgressiveBlurEndpoint;
  nodeId: string;
};

export const getProgressiveBlurHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  openPropertyPanel: TOpenPropertyPanel | null,
): TProgressiveBlurHandleHit | null => {
  const open = getOpenProgressiveBlur(selectedNodes, openPropertyPanel);

  if (open) {
    const { end, start } = getProgressiveBlurWorldPoints(open.node, open.effect);
    const tolerance = PROGRESSIVE_BLUR_HANDLE_RADIUS_PX / viewport.zoom;
    const distanceToStart = Math.hypot(point.x - start.x, point.y - start.y);
    const distanceToEnd = Math.hypot(point.x - end.x, point.y - end.y);

    if (distanceToStart <= tolerance || distanceToEnd <= tolerance) {
      return { effectIndex: open.effectIndex, endpoint: distanceToStart <= distanceToEnd ? 'start' : 'end', nodeId: open.node.id };
    }
  }

  return null;
};
