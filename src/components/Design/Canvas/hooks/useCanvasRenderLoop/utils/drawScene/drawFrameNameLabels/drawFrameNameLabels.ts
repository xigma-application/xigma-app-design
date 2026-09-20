// others
import { FRAME_NAME_LABEL_FILL, FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { concatFloat32Arrays } from './concatFloat32Arrays';
import { drawFrameNameLabelVertices } from './drawFrameNameLabelVertices';
import { getFrameNameLabelVertices } from './getFrameNameLabelVertices';
import { isNestedFrame } from 'store/design/utils/nodeHierarchy/isNestedFrame';

export const drawFrameNameLabels = (
  context: TDrawSceneContext,
  nodes: TSceneNode[],
  selectedIds: Set<string>,
  hoveredNodeId: string | null,
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const { canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const editingNodeId = refs.frameName.editingLabelRef.current;

  const normalVertices: Float32Array[] = [];
  const highlightedVertices: Float32Array[] = [];

  nodes
    .filter(
      (node): node is TSceneNode & { childIds: []; clipContent: true; type: NodeType.frame } =>
        node.type === NodeType.frame && node.name.length > 0 && node.id !== editingNodeId && !isNestedFrame(node, nodesById),
    )
    .forEach((node) => {
      const isHighlighted = selectedIds.has(node.id) || node.id === hoveredNodeId;

      (isHighlighted ? highlightedVertices : normalVertices).push(getFrameNameLabelVertices(node, viewport.zoom));
    });

  [
    { fill: FRAME_NAME_LABEL_FILL, vertices: normalVertices },
    { fill: FRAME_NAME_LABEL_SELECTED_FILL, vertices: highlightedVertices },
  ].forEach(({ fill, vertices }) => {
    if (vertices.length > 0) {
      drawFrameNameLabelVertices(gl, imageContext, concatFloat32Arrays(vertices), fill, canvasWidth, canvasHeight, viewport);
    }
  });
};
