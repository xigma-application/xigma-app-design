// types
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from './bindTarget';
import { drawTexturePass } from './drawTexturePass';
import { expandScissorRect } from './expandScissorRect';
import { getEffectTexture } from 'utils/design/effects/getEffectTexture';
import { getNodeLayerBlur } from './getNodeLayerBlur';
import { getNodeTexture } from './getNodeTexture';
import { renderIntoTarget } from './renderIntoTarget';
import { setScissorRect } from './setScissorRect';

const TEXTURE_CLEAR_PADDING_PX = 64;

const copyTargetRegion = (gl: WebGL2RenderingContext, from: TRenderTarget, to: TRenderTarget, rect: TScissorRect | null): void => {
  const region = rect ?? { height: from.height, width: from.width, x: 0, y: 0 };

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, from.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, to.framebuffer);
  gl.blitFramebuffer(
    region.x,
    region.y,
    region.x + region.width,
    region.y + region.height,
    region.x,
    region.y,
    region.x + region.width,
    region.y + region.height,
    gl.COLOR_BUFFER_BIT,
    gl.NEAREST,
  );
};

export const applyTextureEffect = (renderer: TMaskRenderer, node: TSceneNode, content: TRenderTarget, rect: TScissorRect | null): void => {
  const effect = getNodeTexture(node);

  if (effect) {
    const { context, gl, paintLeaf, pool } = renderer;
    const { clipToShape } = getEffectTexture(effect);
    const clearRect = rect && expandScissorRect(context, gl, rect, TEXTURE_CLEAR_PADDING_PX);
    const shape = clipToShape ? pool.acquire() : null;
    const output = pool.acquire();
    const hasChildren = 'childIds' in node && node.childIds.length > 0;

    if (shape) {
      renderIntoTarget(renderer, shape, () => paintLeaf(node, 'fill'), clearRect);
    }

    bindTarget(renderer, output);
    setScissorRect(gl, clearRect);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    setScissorRect(gl, rect);
    gl.blendFunc(gl.ONE, gl.ZERO);
    drawTexturePass(renderer, node, effect, content, output, {
      hasUnderlay: hasChildren,
      isInputStraight: getNodeLayerBlur(node) > 0,
      shape,
    });
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    setScissorRect(gl, null);
    copyTargetRegion(gl, output, content, rect);

    pool.release(output);

    if (shape) {
      pool.release(shape);
    }
  }
};
