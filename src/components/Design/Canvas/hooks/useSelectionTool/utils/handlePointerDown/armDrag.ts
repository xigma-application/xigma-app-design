import { RefObject } from 'react';

// store
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TDragState, TPendingClickAction } from 'types/design/selectionTool/types';

// utils
import { getVectorNodeOrigin } from '../../../../utils/getVectorNodeOrigin';

export const armDrag = (
  armIds: string[],
  pendingClickAction: TPendingClickAction | null,
  point: TPoint,
  dragStateRef: RefObject<TDragState | null>,
): void => {
  const { nodes } = store.getState().design;

  dragStateRef.current = {
    dispatchThrottle: { frameId: null, run: null },
    hasMoved: false,
    nodeOrigins: Object.fromEntries(
      armIds.map((id) => {
        const node = nodes[id];

        switch (node.type) {
          case NodeType.line:
            return [id, { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 }];
          case NodeType.vector:
            return [id, getVectorNodeOrigin(node)];
          default:
            return [id, { x: node.x, y: node.y }];
        }
      }),
    ),
    pendingClickAction,
    pointerStart: point,
  };
};
