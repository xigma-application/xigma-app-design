// types
import { EffectType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDeviceScissorRect } from './getDeviceScissorRect';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getRotatedCorners } from './getRotatedCorners';
import { glassBackdropStates } from './glassBackdropStates';
import { markGlassBackdropDirty } from './markGlassBackdropDirty';

const DRAWN_NODE_PADDING_PX = 4;

const hasNonGlassEffect = (node: TSceneNode): boolean =>
  'effects' in node && (node.effects ?? []).some((effect) => effect.visible !== false && effect.type !== EffectType.glass);

export const markNodeDrawnOverGlassBackdrop = (renderer: TMaskRenderer, node: TSceneNode): void => {
  if (glassBackdropStates.get(renderer)?.backdrop) {
    if (hasNonGlassEffect(node)) {
      markGlassBackdropDirty(renderer, null);
    } else {
      const strokeWidth = 'strokeWidth' in node ? (node.strokeWidth ?? 0) : 0;
      const scale = renderer.context.viewport.zoom;
      const corners = getRotatedCorners(getNodeBounds(node), 'rotation' in node ? node.rotation : 0);

      markGlassBackdropDirty(renderer, getDeviceScissorRect(renderer, corners, (strokeWidth * scale + DRAWN_NODE_PADDING_PX) * 2));
    }
  }
};
