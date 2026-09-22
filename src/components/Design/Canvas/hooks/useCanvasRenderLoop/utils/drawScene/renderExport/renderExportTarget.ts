// types
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createFixedRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/createFixedRenderTargetPool';
import { createTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/createTarget';
import { disposeTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/disposeTarget';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

export type TRenderedNodePixels = { height: number; pixels: Uint8Array; width: number };

export type TRenderExportDraw = (renderContext: TDrawSceneContext, target: TRenderTarget) => void;

const getSourceBounds = (
  sourceNodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  boundsOverride: TDraftRect | undefined,
): TDraftRect | null => {
  switch (sourceNodeId) {
    case null:
      return boundsOverride ?? null;
    default: {
      const sourceNode = nodesById[sourceNodeId];

      return sourceNode && !sourceNode.hidden ? (boundsOverride ?? getRotatedNodeBounds(sourceNode)) : null;
    }
  }
};

export const renderExportTarget = (
  context: TDrawSceneContext,
  sourceNodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  scale: number,
  boundsOverride: TDraftRect | undefined,
  draw: TRenderExportDraw,
  backgroundColor?: readonly [number, number, number, number],
): TRenderedNodePixels | null => {
  const bounds = getSourceBounds(sourceNodeId, nodesById, boundsOverride);

  if (bounds && bounds.width > 0 && bounds.height > 0) {
    const { gl, imageContext } = context;
    const width = Math.max(1, Math.round(bounds.width * scale));
    const height = Math.max(1, Math.round(bounds.height * scale));
    const target = createTarget(gl, width, height);
    const previousFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    const previousViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;
    const previousAlphaWriteEnabled = imageContext.isAlphaWriteEnabled;
    const previousBlendFunc = [
      gl.getParameter(gl.BLEND_SRC_RGB),
      gl.getParameter(gl.BLEND_DST_RGB),
      gl.getParameter(gl.BLEND_SRC_ALPHA),
      gl.getParameter(gl.BLEND_DST_ALPHA),
    ] as const;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, width, height);
    setAlphaWriteEnabled(gl, imageContext, true);
    gl.clearColor(...(backgroundColor ?? [0, 0, 0, 0]));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const pool = createFixedRenderTargetPool(gl, width, height);
    const renderContext: TDrawSceneContext = {
      ...context,
      canvasHeight: height,
      canvasWidth: width,
      devicePixelHeight: height,
      devicePixelWidth: width,
      imageContext: { ...imageContext, renderTargetPool: pool },
      viewport: { x: -bounds.x * scale, y: -bounds.y * scale, zoom: scale },
    };

    draw(renderContext, target);
    pool.dispose();

    const pixels = new Uint8Array(width * height * 4);

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
    gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
    gl.blendFuncSeparate(...previousBlendFunc);
    setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);
    disposeTarget(gl, target);

    return { height, pixels, width };
  }

  return null;
};
