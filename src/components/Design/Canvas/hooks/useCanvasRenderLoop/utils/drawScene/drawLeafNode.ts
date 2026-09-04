// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

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
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { drawVectorNodeOrTextPathGuide } from './drawVectorNodeOrTextPathGuide';
import { getAutoLayoutDragOpacity } from './getAutoLayoutDragOpacity';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';

export const drawLeafNode = (
  context: TDrawSceneContext,
  node: TSceneNode,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { vectorSnapshots } = refs;
  const draggedVectorNodeSnapshots = vectorSnapshots.draggedVectorNodeSnapshotsRef.current;
  const resizedVectorNodeSnapshots = vectorSnapshots.resizedVectorNodeSnapshotsRef.current;
  const rotatedVectorNodeSnapshots = vectorSnapshots.rotatedVectorNodeSnapshotsRef.current;
  const dragOpacity = getAutoLayoutDragOpacity(refs, node.id);

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
          fillAlpha: dragOpacity,
        },
        canvasWidth,
        canvasHeight,
        viewport,
        node.flipX ?? false,
        node.flipY ?? false,
        node.rotation,
      );
      if (node.strokeColor && node.strokeWidth) {
        drawThickEllipseOutline(
          gl,
          program,
          buffer,
          node,
          node.strokeColor,
          node.strokeWidth,
          canvasWidth,
          canvasHeight,
          viewport,
          node.rotation,
        );
      }
      break;
    case NodeType.polygon:
      drawPolygon(
        gl,
        program,
        buffer,
        { ...node, fillAlpha: dragOpacity },
        canvasWidth,
        canvasHeight,
        viewport,
        node.flipX,
        node.flipY,
        node.rotation,
      );
      break;
    case NodeType.star:
      drawStar(
        gl,
        program,
        buffer,
        { ...node, fillAlpha: dragOpacity },
        canvasWidth,
        canvasHeight,
        viewport,
        node.flipX,
        node.flipY,
        node.rotation,
      );
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
      drawLine(
        gl,
        program,
        buffer,
        node,
        node.stroke,
        node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH,
        canvasWidth,
        canvasHeight,
        viewport,
        dragOpacity,
      );
      drawLineEndpointArrowheads(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
      break;
    case NodeType.path:
      drawPathOutline(gl, program, buffer, node, pathOutlineStyles.get(node.id), canvasWidth, canvasHeight, viewport);
      break;
    case NodeType.vector:
      drawVectorNodeOrTextPathGuide(
        gl,
        program,
        buffer,
        imageContext.faceBufferCache,
        imageContext.strokeBufferCache,
        imageContext.dragSnapshotProgram,
        imageContext.dragSnapshotFaceBufferCache,
        imageContext.dragSnapshotStrokeBufferCache,
        node,
        draggedVectorNodeSnapshots,
        resizedVectorNodeSnapshots,
        rotatedVectorNodeSnapshots,
        canvasWidth,
        canvasHeight,
        viewport,
        imageContext.isAlphaWriteEnabled,
        pathOutlineStyles,
        nodesById,
        editingPathId,
      );
      break;
    case NodeType.group:
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
        node.pathId ? nodesById[node.pathId] : undefined,
      );
      break;
    default:
      drawRect(gl, program, buffer, { ...node, fillAlpha: dragOpacity }, canvasWidth, canvasHeight, viewport, node.rotation);
      if ('strokeColor' in node && node.strokeColor && node.strokeWidth) {
        drawThickOutline(gl, program, buffer, node, node.strokeColor, node.strokeWidth, canvasWidth, canvasHeight, viewport, node.rotation);
      }
  }
};
