// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TBoxSceneNode } from 'types/design/types';

export const commitGridChildRowSpanChange = (dispatch: AppDispatch, node: TBoxSceneNode | undefined, value: number): void => {
  if (node) {
    dispatch(updateNode({ changes: { gridRowSpan: value }, id: node.id }));
  }
};
