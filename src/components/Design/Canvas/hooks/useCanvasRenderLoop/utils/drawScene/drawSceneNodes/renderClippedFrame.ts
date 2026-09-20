// utils
import { bindTarget } from './bindTarget';
import { compositeMask } from '../compositeMask';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getDeviceScissorRect } from './getDeviceScissorRect';
import { getFrameChildIdsInPaintOrder } from 'store/design/utils/getFrameChildIdsInPaintOrder';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getRotatedCorners } from './getRotatedCorners';
import { renderIds } from './renderIds';
import { renderIntoTarget } from './renderIntoTarget';
import { setScissorRect } from './setScissorRect';

// types
import { TFrameNode } from 'types/design/types';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

const CLIP_PADDING_PX = 2;

export const renderClippedFrame = (renderer: TMaskRenderer, frame: TFrameNode, target: TRenderTarget | null): void => {
  const { context, gl, pool } = renderer;
  const { buffer, canvasHeight, canvasWidth, program, viewport } = context;
  const rect = getDeviceScissorRect(renderer, getRotatedCorners(getNodeBounds(frame), frame.rotation), CLIP_PADDING_PX);

  if (!rect.offscreen) {
    const contentTarget = pool.acquire();
    const maskTarget = pool.acquire();

    renderIntoTarget(renderer, contentTarget, () => renderIds(renderer, getFrameChildIdsInPaintOrder(frame), contentTarget), rect);
    renderIntoTarget(
      renderer,
      maskTarget,
      () => drawRect(gl, program, buffer, { ...frame, fill: '#ffffff', fillAlpha: 1 }, canvasWidth, canvasHeight, viewport, frame.rotation),
      rect,
    );
    bindTarget(renderer, target);
    setScissorRect(gl, rect);
    compositeMask(context, contentTarget.texture, maskTarget.texture);
    setScissorRect(gl, null);

    pool.release(contentTarget);
    pool.release(maskTarget);
  }
};
