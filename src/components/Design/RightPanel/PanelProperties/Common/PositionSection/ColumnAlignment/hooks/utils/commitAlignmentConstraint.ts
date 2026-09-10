// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TBoxSceneNode, TNodeAlignment } from 'types/design/types';

export const commitAlignmentConstraint = (dispatch: AppDispatch, node: TBoxSceneNode | undefined, next: TNodeAlignment): void => {
  if (node) {
    const cleaned = next.horizontal === undefined && next.vertical === undefined ? undefined : next;

    dispatch(updateNode({ changes: { alignment: cleaned }, id: node.id }));
  }
};
