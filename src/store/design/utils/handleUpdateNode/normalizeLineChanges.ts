// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TSceneNodeChanges } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getLinePoints } from 'utils/canvas/line/getLinePoints';

export const normalizeLineChanges = (node: TSceneNode, changes: TSceneNodeChanges): TSceneNodeChanges => {
  if (node.type === NodeType.line) {
    if ('x1' in changes || 'x2' in changes || 'y1' in changes || 'y2' in changes) {
      const { x1, x2, y1, y2, ...rest } = { ...getLinePoints(node), ...changes };
      return { ...rest, ...getLineBoxFromPoints({ x1, x2, y1, y2 }) };
    }

    return 'height' in changes ? { ...changes, height: 0 } : changes;
  }

  return changes;
};
