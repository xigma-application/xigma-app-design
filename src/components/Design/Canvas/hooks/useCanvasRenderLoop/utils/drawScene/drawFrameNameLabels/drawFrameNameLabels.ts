// others
import { FRAME_NAME_LABEL_FILL, FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawFrameNameLabel } from './drawFrameNameLabel';

export const drawFrameNameLabels = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  nodes: TSceneNode[],
  selectedIds: Set<string>,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const editingNodeId = refs.frameName.editingLabelRef.current;

  nodes
    .filter((node): node is TSceneNode & { type: NodeType.frame } => node.type === NodeType.frame && node.id !== editingNodeId)
    .forEach((node) => {
      const fill = selectedIds.has(node.id) ? FRAME_NAME_LABEL_SELECTED_FILL : FRAME_NAME_LABEL_FILL;

      drawFrameNameLabel(gl, imageContext, node, fill, canvasWidth, canvasHeight, viewport);
    });
};
