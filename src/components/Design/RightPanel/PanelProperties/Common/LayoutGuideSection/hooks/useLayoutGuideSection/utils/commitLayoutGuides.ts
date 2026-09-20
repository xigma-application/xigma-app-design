// types
import { AppDispatch } from 'store/store';
import { TLayoutGuide } from 'types/design/types';

// others
import { updateNode } from 'store/design/slice';

export const commitLayoutGuides = (dispatch: AppDispatch, nodeId: string | undefined, layoutGuides: TLayoutGuide[]): void => {
  if (nodeId) {
    dispatch(updateNode({ changes: { layoutGuides }, id: nodeId }));
  }
};
