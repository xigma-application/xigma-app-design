// others
import { VALUE_LABEL_TEXT_FILL } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TGlyphQuadBounds } from '../getGlyphQuadBounds';
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawMsdfGlyphs } from '../drawMsdfGlyphs';
import { getMsdfAtlasTexture } from '../getMsdfAtlasTexture';
import { rotateGlyphVertices } from '../rotateGlyphVertices';
import { translateGlyphVertices } from '../translateGlyphVertices';

export const drawValueLabelText = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  rawVertices: Float32Array,
  bounds: TGlyphQuadBounds,
  center: TPoint,
  angleDeg: number,
  fontSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const texture = getMsdfAtlasTexture(gl, imageContext.cache);
  const vertices = rotateGlyphVertices(
    translateGlyphVertices(rawVertices, center.x - (bounds.minX + bounds.maxX) / 2, center.y - (bounds.minY + bounds.maxY) / 2),
    center,
    angleDeg,
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
};
