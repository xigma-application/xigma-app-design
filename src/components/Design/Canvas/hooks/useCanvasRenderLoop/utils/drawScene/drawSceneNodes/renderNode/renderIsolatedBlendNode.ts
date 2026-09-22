// types
import { BlendMode } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from '../bindTarget';
import { captureBackdropTexture } from '../captureBackdropTexture';
import { compositeBlend } from '../../compositeBlend';
import { drawIsolatedContent } from '../drawIsolatedContent';
import { EFFECT_BLUR_MAX_PX } from '../../drawBoxLeafNode/constants';
import { expandScissorRect } from '../expandScissorRect';
import { getIsolatedBlendMode } from '../getIsolatedBlendMode';
import { getIsolatedScissorRect } from '../getIsolatedScissorRect';
import { paintIsolatedContent } from './paintIsolatedContent';
import { renderIntoTarget } from '../renderIntoTarget';
import { setScissorRect } from '../setScissorRect';

const compositeIsolatedContent = (
  renderer: TMaskRenderer,
  contentTexture: WebGLTexture,
  backdrop: TRenderTarget | null,
  blendMode: BlendMode,
): void => {
  if (backdrop) {
    compositeBlend(renderer.context, contentTexture, backdrop.texture, blendMode);
  } else {
    drawIsolatedContent(renderer, contentTexture);
  }
};

const releaseBackdrop = (renderer: TMaskRenderer, backdrop: TRenderTarget | null): void => {
  if (backdrop) {
    renderer.pool.release(backdrop);
  }
};

const renderIsolatedContent = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const { context, gl, pool, refs } = renderer;
  const blendMode = getIsolatedBlendMode(node, refs);
  const rect = getIsolatedScissorRect(renderer, node);

  if (!rect?.offscreen) {
    const backdrop = blendMode === BlendMode.normal ? null : captureBackdropTexture(renderer, rect);
    const contentTarget = pool.acquire();
    const paint = (): void => paintIsolatedContent(renderer, node, contentTarget, rect);

    renderIntoTarget(renderer, contentTarget, paint, rect && expandScissorRect(context, gl, rect, EFFECT_BLUR_MAX_PX));
    bindTarget(renderer, target);
    setScissorRect(gl, rect);
    compositeIsolatedContent(renderer, contentTarget.texture, backdrop, blendMode);
    setScissorRect(gl, null);
    pool.release(contentTarget);
    releaseBackdrop(renderer, backdrop);
  }
};

export const renderIsolatedBlendNode = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  bindTarget(renderer, target);
  renderIsolatedContent(renderer, node, target);
};
