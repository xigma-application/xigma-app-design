// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TImageRenderContext } from '../../../types';
import { TViewport } from 'types/design/types';

// utils
import { drawMsdfGlyphs } from 'utils/canvas/text/drawMsdfGlyphs';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';

export const drawFrameNameLabelVertices = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  vertices: Float32Array,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (vertices.length > 0) {
    const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / viewport.zoom;
    const texture = getMsdfAtlasTexture(gl, imageContext.cache);

    drawMsdfGlyphs(gl, imageContext.msdfProgram, imageContext.msdfBuffer, texture, MSDF_ATLAS_JSON, vertices, fill, fontSize, canvasWidth, canvasHeight, viewport);
  }
};
