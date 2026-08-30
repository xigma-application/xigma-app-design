// others
import {
  FRAME_NAME_LABEL_FONT_SIZE_PX,
  SECTION_NAME_LABEL_CORNER_RADIUS_PX,
  SECTION_NAME_LABEL_FILL,
  SECTION_NAME_LABEL_PADDING_X_PX,
  SECTION_NAME_LABEL_PADDING_Y_PX,
  VALUE_LABEL_TEXT_FILL,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TSectionNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { drawMsdfGlyphs } from 'utils/canvas/text/drawMsdfGlyphs';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getSectionNameLabelBadgeRect } from './getSectionNameLabelBadgeRect';
import { translateGlyphVertices } from 'utils/canvas/text/translateGlyphVertices';

export const drawSectionNameLabel = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  node: TSectionNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.name.length !== 0) {
    const badge = getSectionNameLabelBadgeRect(node, viewport.zoom);

    if (badge) {
      drawRect(
        gl,
        program,
        buffer,
        {
          cornerRadius: SECTION_NAME_LABEL_CORNER_RADIUS_PX / viewport.zoom,
          fill: SECTION_NAME_LABEL_FILL,
          height: badge.height,
          width: badge.width,
          x: badge.x,
          y: badge.y,
        },
        canvasWidth,
        canvasHeight,
        viewport,
        0,
      );

      const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / viewport.zoom;
      const paddingX = SECTION_NAME_LABEL_PADDING_X_PX / viewport.zoom;
      const paddingY = SECTION_NAME_LABEL_PADDING_Y_PX / viewport.zoom;
      const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [badge.text], fontSize, 0, 0));
      const bounds = getGlyphQuadBounds(rawVertices);

      if (bounds) {
        const vertices = translateGlyphVertices(rawVertices, badge.x + paddingX - bounds.minX, badge.y + paddingY - bounds.minY);
        const texture = getMsdfAtlasTexture(gl, imageContext.cache);

        drawMsdfGlyphs(
          gl,
          imageContext.msdfProgram,
          imageContext.msdfBuffer,
          texture,
          MSDF_ATLAS_JSON,
          vertices,
          VALUE_LABEL_TEXT_FILL,
          fontSize,
          canvasWidth,
          canvasHeight,
          viewport,
        );
      }
    }
  }
};
