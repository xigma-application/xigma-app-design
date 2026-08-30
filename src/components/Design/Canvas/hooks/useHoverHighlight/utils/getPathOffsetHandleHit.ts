// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getPathTextOffsetHandleAtPoint } from '../../../utils/getPathTextOffsetHandleAtPoint';
import { isPointOnPathTextHandle } from '../../../utils/isPointOnPathTextHandle';

export const getPathOffsetHandleHit = (
  point: TPoint,
  editingTextBox: TEditingTextBox | null,
  editingNodeId: string | null,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): { hit: boolean; nodeId: string | null } => {
  if (editingTextBox) {
    const pathNode = editingTextBox.pathId ? nodesById[editingTextBox.pathId] : undefined;
    return { hit: isPointOnPathTextHandle(point, editingTextBox, viewport, pathNode), nodeId: editingNodeId };
  }

  const nonEditingHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport, nodesById);
  return { hit: Boolean(nonEditingHandleHit), nodeId: nonEditingHandleHit?.nodeId ?? null };
};
