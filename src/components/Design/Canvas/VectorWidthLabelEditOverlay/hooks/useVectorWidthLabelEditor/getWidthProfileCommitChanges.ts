// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorWidthLabelEdit } from './types';

export const getWidthProfileCommitChanges = (
  edit: TVectorWidthLabelEdit,
  raw: string,
  nodes: Record<string, TSceneNode>,
): { changes: Partial<TVectorNode>; id: string } | null => {
  const trimmed = raw.trim();
  const next = Number(trimmed);

  if (trimmed !== '' && Number.isFinite(next) && next >= 0 && next !== edit.value) {
    const node = nodes[edit.nodeId];

    if (node && node.type === NodeType.vector && node.widthProfile?.points[edit.pointId]) {
      const halfWidth = next / 2;

      return {
        changes: {
          widthProfile: {
            points: {
              ...node.widthProfile.points,
              [edit.pointId]: { ...node.widthProfile.points[edit.pointId], leftOffset: halfWidth, rightOffset: halfWidth },
            },
          },
        },
        id: edit.nodeId,
      };
    }
  }

  return null;
};
