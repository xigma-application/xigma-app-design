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
): { hit: boolean; nodeId: string | null } => {
  if (editingTextBox) {
    return { hit: isPointOnPathTextHandle(point, editingTextBox, viewport), nodeId: editingNodeId };
  }

  const nonEditingHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport);

  return { hit: Boolean(nonEditingHandleHit), nodeId: nonEditingHandleHit?.nodeId ?? null };
};
