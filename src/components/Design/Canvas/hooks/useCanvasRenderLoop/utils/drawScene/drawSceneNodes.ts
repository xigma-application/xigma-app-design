// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawEllipseNode } from 'utils/canvas/drawEllipseNode';
import { drawImage } from 'utils/canvas/drawImage';
import { drawLine } from 'utils/canvas/drawLine';
import { drawLineEndpointArrowheads } from './drawLineEndpointArrowheads';
import { drawMsdfText } from 'utils/canvas/text/drawMsdfText';
import { drawPathOutline } from './drawPathOutline';
import { drawPolygon } from 'utils/canvas/drawPolygon/drawPolygon';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawStar } from 'utils/canvas/drawStar/drawStar';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';

export const drawSceneNodes = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  nodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
): void => {
  nodes.forEach((node) => {
    switch (node.type) {
      case NodeType.ellipse:
        drawEllipseNode(
          gl,
          program,
          buffer,
          {
            ...node,
            arcEndAngle: node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
            arcStartAngle: node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
          },
          canvasWidth,
          canvasHeight,
          viewport,
          node.flipX ?? false,
          node.flipY ?? false,
          node.rotation,
        );
        break;
      case NodeType.polygon:
        drawPolygon(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, node.flipX, node.flipY, node.rotation);
        break;
      case NodeType.star:
        drawStar(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, node.flipX, node.flipY, node.rotation);
        break;
      case NodeType.media:
        drawImage(
          gl,
          imageContext.program,
          imageContext.buffer,
          getOrLoadTexture(gl, imageContext.cache, node.src),
          node,
          canvasWidth,
          canvasHeight,
          viewport,
          node.flipX,
          node.flipY,
          node.rotation,
        );
        break;
      case NodeType.line:
        drawLine(gl, program, buffer, node, node.stroke, LINE_RENDER_STROKE_WIDTH, canvasWidth, canvasHeight, viewport);
        drawLineEndpointArrowheads(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.path:
        drawPathOutline(gl, program, buffer, node, pathOutlineStyles.get(node.id), canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.text:
        drawMsdfText(
          gl,
          imageContext.msdfProgram,
          imageContext.msdfBuffer,
          getMsdfAtlasTexture(gl, imageContext.cache),
          MSDF_ATLAS_JSON,
          imageContext.textGeometryCache,
          imageContext.ellipseArcLengthCache,
          node,
          canvasWidth,
          canvasHeight,
          viewport,
        );
        break;
      default:
        drawRect(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, node.rotation);
    }
  });
};
