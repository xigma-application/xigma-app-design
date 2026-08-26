// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isNodeTransforming } from './isNodeTransforming';

export const getVisibleHoveredNode = (
  nodesById: Record<string, TSceneNode>,
  hoveredNodeId: string | null,
  editingNodeId: string | null,
  refs: TCanvasRefs,
): TSceneNode | null =>
  hoveredNodeId && hoveredNodeId !== editingNodeId && !isNodeTransforming(refs, hoveredNodeId) ? nodesById[hoveredNodeId] : null;
