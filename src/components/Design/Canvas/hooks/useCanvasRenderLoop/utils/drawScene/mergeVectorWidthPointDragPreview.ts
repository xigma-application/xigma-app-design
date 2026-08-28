// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

export const mergeVectorWidthPointDragPreview =
  (refs: TCanvasRefs) =>
  (node: TSceneNode): TSceneNode => {
    const drag = refs.vectorWidth.vectorWidthPointDragRef.current;
    const groupTargetsForNode = drag?.groupTargets.filter((target) => target.nodeId === node.id) ?? [];

    if (drag && node.type === NodeType.vector && (node.id === drag.nodeId || groupTargetsForNode.length > 0)) {
      return {
        ...node,
        widthProfile: {
          points: {
            ...node.widthProfile?.points,
            ...(node.id === drag.nodeId ? { [drag.point.id]: drag.point } : {}),
            ...Object.fromEntries(groupTargetsForNode.map((target) => [target.point.id, target.point])),
          },
        },
      };
    }

    return node;
  };
