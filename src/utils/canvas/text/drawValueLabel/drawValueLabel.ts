// others
import {
  VALUE_LABEL_FILL,
  VALUE_LABEL_FONT_SIZE_PX,
  VALUE_LABEL_OFFSET_PX,
  VALUE_LABEL_PADDING_X_PX,
  VALUE_LABEL_PADDING_Y_PX,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { buildGlyphQuads } from '../buildGlyphQuads';
import { drawValueLabelBadge } from './drawValueLabelBadge';
import { drawValueLabelBorder } from './drawValueLabelBorder';
import { drawValueLabelText } from './drawValueLabelText';
import { getGlyphQuadBounds } from '../getGlyphQuadBounds';
import { getValueLabelBadgeGeometry } from './getValueLabelBadgeGeometry';

export type TValueLabelOptions = {
  angleDeg?: number;
  edgeGapPx?: number;
  fill?: string;
  isHovered?: boolean;
};

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
  options: TValueLabelOptions = {},
): void => {
  const { angleDeg = 0, edgeGapPx, fill = VALUE_LABEL_FILL, isHovered = false } = options;
  const fontSize = VALUE_LABEL_FONT_SIZE_PX / viewport.zoom;
  const paddingX = VALUE_LABEL_PADDING_X_PX / viewport.zoom;
  const paddingY = VALUE_LABEL_PADDING_Y_PX / viewport.zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  if (bounds) {
    const { badgeHeight, badgeWidth, center } = getValueLabelBadgeGeometry(
      bounds,
      anchor,
      offsetDirection,
      paddingX,
      paddingY,
      VALUE_LABEL_OFFSET_PX / viewport.zoom,
      edgeGapPx,
      viewport.zoom,
    );

    if (isHovered) {
      drawValueLabelBorder(gl, program, buffer, center, badgeWidth, badgeHeight, canvasWidth, canvasHeight, viewport, angleDeg);
    }

    drawValueLabelBadge(gl, program, buffer, center, badgeWidth, badgeHeight, fill, canvasWidth, canvasHeight, viewport, angleDeg);
    drawValueLabelText(gl, imageContext, rawVertices, bounds, center, angleDeg, fontSize, canvasWidth, canvasHeight, viewport);
  }
};
