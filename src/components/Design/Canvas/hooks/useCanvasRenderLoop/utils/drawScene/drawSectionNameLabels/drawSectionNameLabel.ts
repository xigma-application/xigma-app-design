// others
import {
  FRAME_NAME_LABEL_FONT_SIZE_PX,
  SECTION_NAME_LABEL_CORNER_RADIUS_PX,
  SECTION_NAME_LABEL_FILL,
  VALUE_LABEL_TEXT_FILL,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TSectionNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawMsdfGlyphs } from 'utils/canvas/text/drawMsdfGlyphs';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';
import { getSectionNameLabelBadgeRect, TSectionNameLabelBadgeRect } from './getSectionNameLabelBadgeRect';
import { getSectionNameLabelVertices } from './getSectionNameLabelVertices';

const drawSectionNameLabelText = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  badge: TSectionNameLabelBadgeRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / viewport.zoom;
  const vertices = getSectionNameLabelVertices(badge, viewport.zoom);

  if (vertices) {
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
};

const drawSectionNameLabelBadge = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  badge: TSectionNameLabelBadgeRect | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
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

    drawSectionNameLabelText(gl, imageContext, badge, canvasWidth, canvasHeight, viewport);
  }
};

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

    drawSectionNameLabelBadge(gl, program, buffer, imageContext, badge, canvasWidth, canvasHeight, viewport);
  }
};
