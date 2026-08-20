// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

const BEND_OFFSET_SCALE = 4 / 3;

export const applyVectorSegmentBendOffset = (
  node: TVectorNode,
  bendState: Extract<TVectorSegmentBendDragState, { status: 'committed' }>,
  dx: number,
  dy: number,
  dispatch: AppDispatch,
  setClassName: (className: string | null) => void,
): void => {
  const offsetX = dx * BEND_OFFSET_SCALE;
  const offsetY = dy * BEND_OFFSET_SCALE;
  const segment = node.segments[bendState.segmentId];
  const segments = {
    ...node.segments,
    [bendState.segmentId]: {
      ...segment,
      tangentEnd: { x: bendState.tangentEnd.x + offsetX, y: bendState.tangentEnd.y + offsetY },
      tangentStart: { x: bendState.tangentStart.x + offsetX, y: bendState.tangentStart.y + offsetY },
    },
  };

  dispatch(updateNode({ changes: { segments }, id: bendState.nodeId }));
  setClassName('bend');
};
