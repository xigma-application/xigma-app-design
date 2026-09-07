// types
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getAxisConstraintDelta } from '../getAxisConstraintDelta';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../nodeHierarchy/getGroupSubtreeNodes';
import { getNodeAbsoluteFromParentPosition } from '../getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from '../getNodePositionInParent';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isFreeformFrame } from 'utils/canvas/signals/isFreeformFrame';

export type TFrameBoxSnapshot = { height: number; rotation: number; width: number; x: number; y: number };

export const syncConstrainedFrameChildren = (
  state: TDesignState,
  frameId: string | null,
  previousBox: TFrameBoxSnapshot | undefined,
): void => {
  if (frameId && previousBox) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (frame && isFreeformFrame(frame)) {
      const widthDelta = frame.width - previousBox.width;
      const heightDelta = frame.height - previousBox.height;

      frame.childIds.forEach((childId) => {
        const child = nodes[childId];

        if (child && isBoxSceneNode(child)) {
          const oldLocal = getNodePositionInParent(child, previousBox);
          const targetLocal = {
            x: oldLocal.x + getAxisConstraintDelta(child.alignment?.horizontal, widthDelta),
            y: oldLocal.y + getAxisConstraintDelta(child.alignment?.vertical, heightDelta),
          };
          const targetAbsolute = getNodeAbsoluteFromParentPosition(targetLocal, frame);
          const deltaX = Math.round(targetAbsolute.x) - child.x;
          const deltaY = Math.round(targetAbsolute.y) - child.y;

          if (deltaX !== 0 || deltaY !== 0) {
            getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => {
              Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));
            });
          }
        }
      });
    }
  }
};
