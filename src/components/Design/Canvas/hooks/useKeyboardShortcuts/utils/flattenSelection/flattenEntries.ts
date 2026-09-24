// store
import { deleteNode, replaceNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TFlattenEntry } from './types';

// utils
import { getMergedFlattenVector } from './getMergedFlattenVector';
import { getSingleFlattenVector } from './getSingleFlattenVector';

export const flattenEntries = (dispatch: AppDispatch, entries: TFlattenEntry[]): void => {
  if (entries.length > 1) {
    const merged = getMergedFlattenVector(entries);

    entries.slice(0, -1).forEach(({ node }) => dispatch(deleteNode(node.id)));
    dispatch(replaceNode({ id: merged.id, node: merged }));
  } else {
    const vector = getSingleFlattenVector(entries[0]);

    if (vector) {
      dispatch(replaceNode({ id: entries[0].node.id, node: { ...vector, id: entries[0].node.id } }));
    }
  }
};
