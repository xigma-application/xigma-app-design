// constant
import { MAX_PATTERN_SOURCE_RESOLUTION_DEPTH } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

// utils
import { collectPatternSourceSubtree } from './collectPatternSourceSubtree';
import { drawLeafNode } from './drawLeafNode';
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';
import { TPatternSourceTile } from 'utils/canvas/drawVectorNode/drawVectorPatternSourceTile';

export type TResolvedPatternSourceTile = { release: () => void; tile: TPatternSourceTile };

export const resolvePatternSourceTile = (
  context: TDrawSceneContext,
  sourceNodeId: string,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): TResolvedPatternSourceTile | null => {
  if (patternSourceDepth < MAX_PATTERN_SOURCE_RESOLUTION_DEPTH) {
    const sourceNode = nodesById[sourceNodeId];

    if (sourceNode && !sourceNode.hidden) {
      const bounds = getRotatedNodeBounds(sourceNode);

      if (bounds.width > 0 && bounds.height > 0) {
        const { gl, imageContext } = context;
        const pool = imageContext.renderTargetPool;
        const target = pool.acquire();
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
        gl.viewport(0, 0, target.width, target.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        setAlphaWriteEnabled(gl, imageContext, true);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        collectPatternSourceSubtree(sourceNodeId, nodesById).forEach((node) => {
          drawLeafNode(context, node, pathOutlineStyles, refs, nodesById, editingPathId, patternSourceDepth + 1);
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, previousFramebuffer);
        gl.viewport(previousViewport[0], previousViewport[1], previousViewport[2], previousViewport[3]);
        gl.blendFuncSeparate(...previousBlendFunc);
        setAlphaWriteEnabled(gl, imageContext, previousAlphaWriteEnabled);

        return {
          release: () => pool.release(target),
          tile: { height: bounds.height, texture: target.texture, width: bounds.width, x: bounds.x, y: bounds.y },
        };
      }
    }
  }

  return null;
};
