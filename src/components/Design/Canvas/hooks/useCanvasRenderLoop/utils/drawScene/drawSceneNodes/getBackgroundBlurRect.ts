// types
import { TMaskRenderer, TScissorRect } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDeviceScissorRect } from './getDeviceScissorRect';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getRotatedCorners } from './getRotatedCorners';

const BACKGROUND_BLUR_RECT_PADDING_PX = 4;

export const getBackgroundBlurRect = (renderer: TMaskRenderer, node: TSceneNode, radius: number): TScissorRect =>
  getDeviceScissorRect(
    renderer,
    getRotatedCorners(getNodeBounds(node), 'rotation' in node ? node.rotation : 0),
    radius * 2 + BACKGROUND_BLUR_RECT_PADDING_PX,
  );
