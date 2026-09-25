// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TBoxPaintPhase, TDrawSceneContext } from './types';
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

// utils
import { drawBooleanLeafNode } from './drawBooleanLeafNode/drawBooleanLeafNode';
import { drawBoxLeafNode } from './drawBoxLeafNode/drawBoxLeafNode';
import { drawEllipseLeafNode } from './drawEllipseLeafNode/drawEllipseLeafNode';
import { drawLineLeafNode } from './drawLineLeafNode';
import { drawMediaLeafNode } from './drawMediaLeafNode';
import { drawPathOutline } from './drawPathOutline';
import { drawPolygonLeafNode } from './drawPolygonLeafNode';
import { drawStarLeafNode } from './drawStarLeafNode';
import { drawTextLeafNode } from './drawTextLeafNode';
import { drawVectorNodeOrTextPathGuide } from './drawVectorNodeOrTextPathGuide/drawVectorNodeOrTextPathGuide';
import { getAutoLayoutDragOpacity } from './getAutoLayoutDragOpacity';
import { getAutoLayoutReorderRenderNode } from './getAutoLayoutReorderRenderNode';
import { getEffectiveOpacity } from './getEffectiveOpacity';
import { getGridDragRenderNode } from './getGridDragRenderNode';

export const drawLeafNode = (
  context: TDrawSceneContext,
  rawNode: TSceneNode,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
  patternSourceDepth = 0,
  phase: TBoxPaintPhase = 'all',
): void => {
  const node = getGridDragRenderNode(refs, getAutoLayoutReorderRenderNode(refs, rawNode, nodesById), nodesById);
  const opacity = getEffectiveOpacity(node, nodesById) * getAutoLayoutDragOpacity(refs, node.id);

  switch (node.type) {
    case NodeType.boolean:
      drawBooleanLeafNode(context, node, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
      break;
    case NodeType.ellipse:
      drawEllipseLeafNode(context, node, opacity);
      break;
    case NodeType.polygon:
      drawPolygonLeafNode(context, node, opacity);
      break;
    case NodeType.star:
      drawStarLeafNode(context, node, opacity);
      break;
    case NodeType.media:
      drawMediaLeafNode(context, node);
      break;
    case NodeType.line:
      drawLineLeafNode(context, node, opacity);
      break;
    case NodeType.path:
      drawPathOutline(context, node, pathOutlineStyles.get(node.id));
      break;
    case NodeType.vector:
      drawVectorNodeOrTextPathGuide(context, node, refs.vectorSnapshots, pathOutlineStyles, nodesById, editingPathId);
      break;
    case NodeType.group:
    case NodeType.mask:
    case NodeType.slice:
      break;
    case NodeType.text:
      drawTextLeafNode(context, node, nodesById);
      break;
    default:
      drawBoxLeafNode(context, node, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth, phase);
  }
};
