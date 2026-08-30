// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TFrameNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { drawMsdfGlyphs } from 'utils/canvas/text/drawMsdfGlyphs';
import { getFrameNameLabelAnchor } from './getFrameNameLabelAnchor';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';
import { rotateGlyphVertices } from 'utils/canvas/text/rotateGlyphVertices';
import { translateGlyphVertices } from 'utils/canvas/text/translateGlyphVertices';
import { truncateTextToWidth } from 'utils/canvas/text/truncateTextToWidth';

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
    const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / viewport.zoom;
    const { angleDeg, maxWidth, point } = getFrameNameLabelAnchor(node, viewport.zoom);
    const text = truncateTextToWidth(node.name, maxWidth, fontSize);
    const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
    const bounds = getGlyphQuadBounds(rawVertices);

    if (bounds) {
      const vertices = rotateGlyphVertices(
        translateGlyphVertices(rawVertices, point.x - bounds.minX, point.y - bounds.minY),
        point,
        angleDeg,
      );
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
