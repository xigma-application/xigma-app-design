// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, MASK_OUTLINE_STROKE, MASK_OUTLINE_WIDTH_PX } from 'constant/canvas';

// store
import { selectAreMaskOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawThickEllipseNodeOutline } from 'utils/canvas/shapes/drawThickEllipseNodeOutline';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { drawThickPolygonOutline } from 'utils/canvas/shapes/drawThickPolygonOutline';
import { drawThickStarOutline } from 'utils/canvas/shapes/drawThickStarOutline';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';

export const drawMaskOutlines = (context: TDrawSceneContext, sceneNodes: TSceneNode[]): void => {
  if (selectAreMaskOutlinesVisible(store.getState())) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

    sceneNodes.forEach((node) => {
      if (!node.isMask) {
        return;
      }

      switch (node.type) {
        case NodeType.ellipse:
          drawThickEllipseNodeOutline(
            gl,
            program,
            buffer,
            {
              ...node,
              arcEndAngle: node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
              arcStartAngle: node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
            },
            MASK_OUTLINE_STROKE,
            MASK_OUTLINE_WIDTH_PX,
            canvasWidth,
            canvasHeight,
            viewport,
            node.flipX ?? false,
            node.flipY ?? false,
            node.rotation,
          );
          break;
        case NodeType.polygon:
          drawThickPolygonOutline(
            gl,
            program,
            buffer,
            node,
            MASK_OUTLINE_STROKE,
            MASK_OUTLINE_WIDTH_PX,
            canvasWidth,
            canvasHeight,
            viewport,
            node.flipX,
            node.flipY,
            node.rotation,
          );
          break;
        case NodeType.star:
          drawThickStarOutline(
            gl,
            program,
            buffer,
            node,
            MASK_OUTLINE_STROKE,
            MASK_OUTLINE_WIDTH_PX,
            canvasWidth,
            canvasHeight,
            viewport,
            node.flipX,
            node.flipY,
            node.rotation,
          );
          break;
        case NodeType.line:
          drawLine(gl, program, buffer, node, MASK_OUTLINE_STROKE, MASK_OUTLINE_WIDTH_PX / viewport.zoom, canvasWidth, canvasHeight, viewport);
          break;
        case NodeType.vector:
          drawVectorStroke(
            gl,
            program,
            buffer,
            flattenVectorSegments(getRenderedVectorNode(node)),
            MASK_OUTLINE_STROKE,
            MASK_OUTLINE_WIDTH_PX / viewport.zoom,
            canvasWidth,
            canvasHeight,
            viewport,
          );
          break;
        default:
          drawThickOutline(gl, program, buffer, node, MASK_OUTLINE_STROKE, MASK_OUTLINE_WIDTH_PX, canvasWidth, canvasHeight, viewport, node.rotation);
      }
    });
  }
};
