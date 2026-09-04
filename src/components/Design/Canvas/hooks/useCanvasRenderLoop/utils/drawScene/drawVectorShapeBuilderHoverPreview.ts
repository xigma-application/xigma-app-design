// others
import { DRAFT_FRAME_STROKE, VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TCanvasRefs, TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawShapeBuilderNodeFacesHatch } from './drawShapeBuilderNodeFacesHatch';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorFacesInRect } from 'components/Design/Canvas/utils/getVectorFacesInRect';
import { getVectorFacesOnPath } from 'components/Design/Canvas/utils/getVectorFacesOnPath';
import { groupCrossingVectorNodes } from 'utils/canvas/vectorNetwork/mergeVectorNodes/groupCrossingVectorNodes';
import { toDraftRect } from 'components/Design/Canvas/utils/toDraftRect';

export const drawVectorShapeBuilderHoverPreview = (
  context: TDrawSceneContext,
  nodes: Record<string, TSceneNode>,
  rootOrder: string[],
  vectorEditingNodeIds: string[],
  touchedFaces: TVectorShapeBuilderTouchedFaces,
  refs: TCanvasRefs,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const isSubtract = refs.shapeBuilder.isVectorShapeBuilderSubtractRef.current;
  const path = refs.shapeBuilder.vectorShapeBuilderPathRef.current;
  const isBoxMode = refs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current;
  const color = isSubtract ? VECTOR_EDGE_HOVER_STROKE : DRAFT_FRAME_STROKE;
  const touchedNodeIds = Object.keys(touchedFaces).filter((nodeId) => touchedFaces[nodeId].size > 0);

  if (touchedNodeIds.length >= 1 && path && path.length > 0) {
    const openNodes = rootOrder
      .filter((nodeId) => vectorEditingNodeIds.includes(nodeId))
      .map((nodeId) => getVectorEditingNode(nodes, nodeId))
      .filter((node): node is TVectorNode => node !== null);

    groupCrossingVectorNodes(openNodes).forEach((group) => {
      const isGroupTouched = group.nodeIds.some((nodeId) => touchedNodeIds.includes(nodeId));

      if (isGroupTouched) {
        if (group.nodeIds.length === 1) {
          drawShapeBuilderNodeFacesHatch(
            gl,
            program,
            buffer,
            getVectorEditingNode(nodes, group.nodeIds[0]),
            touchedFaces[group.nodeIds[0]],
            color,
            canvasWidth,
            canvasHeight,
            viewport,
            imageContext.isAlphaWriteEnabled,
          );
        } else {
          const faces = isBoxMode
            ? getVectorFacesInRect(group.combinedNode, toDraftRect(path[0], path[path.length - 1]))
            : getVectorFacesOnPath(group.combinedNode, path);

          faces.forEach((face) =>
            drawVectorHatchFill(
              gl,
              program,
              buffer,
              [face.points],
              color,
              canvasWidth,
              canvasHeight,
              viewport,
              imageContext.isAlphaWriteEnabled,
            ),
          );
        }
      }
    });
  } else {
    touchedNodeIds.forEach((nodeId) =>
      drawShapeBuilderNodeFacesHatch(
        gl,
        program,
        buffer,
        getVectorEditingNode(nodes, nodeId),
        touchedFaces[nodeId],
        color,
        canvasWidth,
        canvasHeight,
        viewport,
        imageContext.isAlphaWriteEnabled,
      ),
    );
  }
};
