// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TScissorRect } from './types';

// utils
import { copyTargetRectToTexture } from './copyTargetRectToTexture';
import { getGlassValidWindow } from './getGlassValidWindow';
import { putGlassCacheEntry } from './putGlassCacheEntry';

export const storeGlassCacheEntry = (
  gl: WebGL2RenderingContext,
  nodeId: string,
  nodesState: unknown,
  warped: TRenderTarget,
  mask: TRenderTarget,
  rect: TScissorRect,
): void => {
  const content = copyTargetRectToTexture(gl, warped, rect);
  const shape = copyTargetRectToTexture(gl, mask, rect);

  putGlassCacheEntry(gl, nodeId, {
    ...getGlassValidWindow(rect),
    framebuffer: content.framebuffer,
    height: rect.height,
    maskFramebuffer: shape.framebuffer,
    maskTexture: shape.texture,
    nodesState,
    rawHeight: rect.rawHeight ?? rect.height,
    rawWidth: rect.rawWidth ?? rect.width,
    texture: content.texture,
    width: rect.width,
  });
};
