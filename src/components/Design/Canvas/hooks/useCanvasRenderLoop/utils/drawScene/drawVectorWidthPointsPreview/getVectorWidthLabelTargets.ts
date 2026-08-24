// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorWidthPoint } from 'types/design/types';

// utils
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export type TVectorWidthLabelTarget = { nodeId: string; point: TVectorWidthPoint; side: 'left' | 'right' };

export const getVectorWidthLabelTargets = (refs: TCanvasRefs, nodes: Record<string, TSceneNode>): TVectorWidthLabelTarget[] => {
  const drag = refs.vectorWidthPointDragRef.current;

  if (drag) {
    if (drag.target === 'point') {
      return [];
    }

    const side = drag.target;

    return [
      { nodeId: drag.nodeId, point: drag.point, side },
      ...drag.groupTargets.map((target) => ({ nodeId: target.nodeId, point: target.point, side })),
    ];
  }

  const selected = refs.selectedVectorWidthHandlesRef.current[0];
  const node = selected && getVectorEditingNode(nodes, selected.nodeId);
  const point = selected && node?.widthProfile?.points[selected.pointId];
  const lastSide = refs.lastVectorWidthHandleSideRef.current;
  const side =
    selected && lastSide && lastSide.nodeId === selected.nodeId && lastSide.pointId === selected.pointId ? lastSide.side : 'right';

  return selected && point ? [{ nodeId: selected.nodeId, point, side }] : [];
};
