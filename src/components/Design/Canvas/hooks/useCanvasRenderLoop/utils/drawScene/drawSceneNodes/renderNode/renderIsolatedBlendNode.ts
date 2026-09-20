// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from '../bindTarget';
import { blurIsolatedNode } from '../blurIsolatedNode';
import { captureBackdropTexture } from '../captureBackdropTexture';
import { compositeBlend } from '../../compositeBlend';
import { dispatchNodeType } from './dispatchNodeType';
import { getIsolatedBlendMode } from '../getIsolatedBlendMode';
import { renderIntoTarget } from '../renderIntoTarget';

export const renderIsolatedBlendNode = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const { context, pool, refs } = renderer;

  bindTarget(renderer, target);

  const backdrop = captureBackdropTexture(renderer);
  const contentTarget = pool.acquire();

  renderIntoTarget(renderer, contentTarget, () => dispatchNodeType(renderer, node, contentTarget));
  blurIsolatedNode(renderer, node, contentTarget);
  bindTarget(renderer, target);
  compositeBlend(context, contentTarget.texture, backdrop.texture, getIsolatedBlendMode(node, refs));

  pool.release(contentTarget);
  pool.release(backdrop);
};
