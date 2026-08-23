// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { severVectorSegmentAtPoint } from 'utils/canvas/vectorNetwork/cutVectorNetwork/severVectorSegmentAtPoint';

export const commitVectorSplit = (dispatch: AppDispatch, node: TVectorNode, segmentId: string, t: number): void => {
  dispatch(updateNode({ changes: severVectorSegmentAtPoint(node, segmentId, t), id: node.id }));
};
