// others
import {
  VALUE_LABEL_CORNER_RADIUS_PX,
  VALUE_LABEL_FILL,
  VALUE_LABEL_FONT_SIZE_PX,
  VALUE_LABEL_OFFSET_PX,
  VALUE_LABEL_PADDING_X_PX,
  VALUE_LABEL_PADDING_Y_PX,
  VALUE_LABEL_TEXT_FILL,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { buildGlyphQuads } from './buildGlyphQuads';
import { drawMsdfGlyphs } from './drawMsdfGlyphs';
import { drawRect } from '../drawRect/drawRect';
import { getGlyphQuadBounds } from './getGlyphQuadBounds';
import { getMsdfAtlasTexture } from './getMsdfAtlasTexture';
import { translateGlyphVertices } from './translateGlyphVertices';

// offsetDirection must be a unit vector — the badge sits this far along it, away from the anchor
export const drawValueLabel = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  text: string,
  anchor: TPoint,
  offsetDirection: TPoint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const fontSize = VALUE_LABEL_FONT_SIZE_PX / viewport.zoom;
  const paddingX = VALUE_LABEL_PADDING_X_PX / viewport.zoom;
  const paddingY = VALUE_LABEL_PADDING_Y_PX / viewport.zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);
  const offset = VALUE_LABEL_OFFSET_PX / viewport.zoom;
  const center: TPoint = { x: anchor.x + offsetDirection.x * offset, y: anchor.y + offsetDirection.y * offset };

  if (bounds) {
    const badgeWidth = bounds.maxX - bounds.minX + paddingX * 2;
    const badgeHeight = bounds.maxY - bounds.minY + paddingY * 2;
    const texture = getMsdfAtlasTexture(gl, imageContext.cache);
    const vertices = translateGlyphVertices(
      rawVertices,
      center.x - (bounds.minX + bounds.maxX) / 2,
      center.y - (bounds.minY + bounds.maxY) / 2,
    );

    drawRect(
      gl,
      program,
      buffer,
      {
        cornerRadius: VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom,
        fill: VALUE_LABEL_FILL,
        height: badgeHeight,
        width: badgeWidth,
        x: center.x - badgeWidth / 2,
        y: center.y - badgeHeight / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
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
};
