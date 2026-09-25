// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX, SECTION_NAME_LABEL_CORNER_RADIUS_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TSectionNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';
import { TSectionNameLabelStyle } from 'utils/canvas/sectionNameLabel/types';

// utils
import { drawMsdfGlyphs } from 'utils/canvas/text/drawMsdfGlyphs';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawSectionNameLabelStroke } from './drawSectionNameLabelStroke';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';
import { getSectionNameLabelStyle } from 'utils/canvas/sectionNameLabel/getSectionNameLabelStyle';
import { getSectionNameLabelBadgeRect, TSectionNameLabelBadgeRect } from './getSectionNameLabelBadgeRect';
import { getSectionNameLabelVertices } from './getSectionNameLabelVertices';

const drawSectionNameLabelText = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  badge: TSectionNameLabelBadgeRect,
  textFill: string,
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
      textFill,
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
  style: TSectionNameLabelStyle,
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
        fill: style.fill,
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
    drawSectionNameLabelStroke(
      { buffer, canvasHeight, canvasWidth, gl, program, viewport },
      { ...badge, cornerRadius: SECTION_NAME_LABEL_CORNER_RADIUS_PX / viewport.zoom },
      style,
    );

    drawSectionNameLabelText(gl, imageContext, badge, style.textFill, canvasWidth, canvasHeight, viewport);
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
  backgroundColor: string,
): void => {
  if (node.name.length !== 0) {
    const badge = getSectionNameLabelBadgeRect(node, viewport.zoom);
    const style = getSectionNameLabelStyle(node, backgroundColor);

    drawSectionNameLabelBadge(gl, program, buffer, imageContext, badge, style, canvasWidth, canvasHeight, viewport);
  }
};
