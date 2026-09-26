// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { drawDashedVectorPathOutline } from './drawDashedVectorPathOutline/drawDashedVectorPathOutline';
import { drawSceneVectorNode } from './drawSceneVectorNode/drawSceneVectorNode';
import { isVectorBoundAsTextPath } from 'utils/canvas/vector/isVectorBoundAsTextPath';
import { mirrorGuideVectorForText } from 'utils/canvas/text/mirrorGuideVectorForText';

export const drawVectorNodeOrTextPathGuide = (
  context: TDrawSceneContext,
  node: TVectorNode,
  refs: TCanvasRefs,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
  opacity = 1,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const outlineStyle = pathOutlineStyles.get(node.id);
  const isBoundAsTextPath = isVectorBoundAsTextPath(nodesById, node.id) || node.id === editingPathId;

  if (!isBoundAsTextPath || outlineStyle) {
    const renderNode = mirrorGuideVectorForText(node, nodesById);

    if (isBoundAsTextPath) {
      drawDashedVectorPathOutline(gl, program, buffer, renderNode, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    } else {
      drawSceneVectorNode(context, renderNode, refs, opacity);
    }
  }
};
