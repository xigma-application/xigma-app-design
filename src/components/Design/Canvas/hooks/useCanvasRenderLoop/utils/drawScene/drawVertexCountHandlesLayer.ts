// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawPolygonVertexCountHandle } from 'utils/canvas/drawPolygonVertexCountHandle';
import { drawStarVertexCountHandle } from 'utils/canvas/drawStarVertexCountHandle';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { shouldShowVertexCountHandle } from 'utils/canvas/vertexCount/shouldShowVertexCountHandle';

const hasVertexCount = (node: TSceneNode): boolean => node.type === NodeType.polygon || node.type === NodeType.star;

export const drawVertexCountHandlesLayer = (
  context: TDrawSceneContext,
  hoveredNode: TSceneNode | null | undefined,
  selectedNodes: TSceneNode[],
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const [selectedNode] = selectedNodes;

  if (selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id && hasVertexCount(selectedNode)) {
    const bounds = getNodeBounds(selectedNode);

    // eslint-disable-next-line default-case -- hasVertexCount already guarantees one of the cases below matches, so a default arm would be dead code unreachable by any test
    switch (true) {
      case !shouldShowVertexCountHandle(bounds, viewport):
        break;
      case selectedNode.type === NodeType.polygon:
        drawPolygonVertexCountHandle(
          gl,
          program,
          buffer,
          bounds,
          selectedNode.sides,
          selectedNode.cornerRadius ?? 0,
          DRAFT_FRAME_STROKE,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
        );
        break;
      case selectedNode.type === NodeType.star:
        drawStarVertexCountHandle(
          gl,
          program,
          buffer,
          bounds,
          selectedNode.points,
          selectedNode.ratio,
          selectedNode.cornerRadius ?? 0,
          DRAFT_FRAME_STROKE,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
        );
        break;
    }
  }
};
