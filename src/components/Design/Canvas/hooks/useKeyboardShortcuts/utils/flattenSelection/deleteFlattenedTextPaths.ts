// store
import { deleteNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFlattenEntry } from './types';

export const deleteFlattenedTextPaths = (dispatch: AppDispatch, entries: TFlattenEntry[]): void => {
  entries.forEach(({ node }) => {
    if (node.type === NodeType.text && node.pathId) {
      dispatch(deleteNode(node.pathId));
    }
  });
};
