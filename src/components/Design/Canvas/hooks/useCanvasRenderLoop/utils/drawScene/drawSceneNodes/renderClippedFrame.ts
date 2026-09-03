// utils
import { bindTarget } from './bindTarget';
import { compositeMask } from '../compositeMask';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { renderIds } from './renderIds';
import { renderIntoTarget } from './renderIntoTarget';

// types
import { TFrameNode } from 'types/design/types';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const renderClippedFrame = (renderer: TMaskRenderer, frame: TFrameNode, target: TRenderTarget | null): void => {
  const { context, pool } = renderer;
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const contentTarget = pool.acquire();
  const maskTarget = pool.acquire();

  renderIntoTarget(renderer, contentTarget, () => renderIds(renderer, frame.childIds, contentTarget));
  renderIntoTarget(renderer, maskTarget, () =>
    drawRect(gl, program, buffer, { ...frame, fill: '#ffffff', fillAlpha: 1 }, canvasWidth, canvasHeight, viewport, frame.rotation),
  );
  bindTarget(renderer, target);
  compositeMask(context, contentTarget.texture, maskTarget.texture);

  pool.release(contentTarget);
  pool.release(maskTarget);
};
