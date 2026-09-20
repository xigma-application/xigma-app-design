// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TFrameNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawMsdfGlyphs } from 'utils/canvas/text/drawMsdfGlyphs';
import { getFrameNameLabelVertices } from './getFrameNameLabelVertices';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';

export const drawFrameNameLabel = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  node: TFrameNode,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.name.length > 0) {
    const vertices = getFrameNameLabelVertices(node, viewport.zoom);

    if (vertices.length > 0) {
      const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / viewport.zoom;
      const texture = getMsdfAtlasTexture(gl, imageContext.cache);

      drawMsdfGlyphs(
        gl,
        imageContext.msdfProgram,
        imageContext.msdfBuffer,
        texture,
        MSDF_ATLAS_JSON,
        vertices,
        fill,
        fontSize,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }
  }
};
