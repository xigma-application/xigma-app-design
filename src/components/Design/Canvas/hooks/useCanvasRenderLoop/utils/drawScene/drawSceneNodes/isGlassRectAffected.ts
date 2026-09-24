// types
import { TChangedNodes } from 'store/design/utils/getChangedNodes';
import { TMaskRenderer, TScissorRect } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { doScissorRectsOverlap } from './doScissorRectsOverlap';
import { getDeviceScissorRect } from './getDeviceScissorRect';
import { getDevicePixelWidth } from '../getDevicePixelWidth';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getNodeChangeMargin } from './getNodeChangeMargin';
import { getRotatedCorners } from './getRotatedCorners';

export const isGlassRectAffected = (renderer: TMaskRenderer, nodeId: string, rect: TScissorRect, changed: TChangedNodes): boolean => {
  if (!changed.all && !changed.ids.has(nodeId)) {
    const { context, gl } = renderer;
    const pixelRatio = context.canvasWidth > 0 ? getDevicePixelWidth(context, gl) / context.canvasWidth : 1;
    const scale = context.viewport.zoom * pixelRatio;

    return changed.nodes.some((changedNode: TSceneNode) => {
      const changedRect = getDeviceScissorRect(
        renderer,
        getRotatedCorners(getNodeBounds(changedNode), 'rotation' in changedNode ? changedNode.rotation : 0),
        getNodeChangeMargin(changedNode) * scale,
      );

      return !changedRect.offscreen && doScissorRectsOverlap(changedRect, rect);
    });
  }

  return true;
};
