// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { updateNode } from 'store/design/slice';

// types
import { TDistributeAxis } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAxisSpan } from './getAxisSpan';
import { getFrameBoxChildren } from './getFrameBoxChildren';

export const distributeFrameChildren = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode | undefined,
  axis: TDistributeAxis,
): void => {
  if (frame) {
    const children = getFrameBoxChildren(nodes, frame).sort((a, b) => getAxisSpan(a, axis).start - getAxisSpan(b, axis).start);
    const spans = children.map((child) => getAxisSpan(child, axis));
    const start = Math.min(...spans.map((span) => span.start));
    const end = Math.max(...spans.map((span) => span.start + span.size));
    const totalSize = spans.reduce((sum, span) => sum + span.size, 0);
    const gap = (end - start - totalSize) / (children.length - 1);

    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    children.reduce((cursor, child, index) => {
      dispatch(updateNode({ changes: axis === 'horizontal' ? { x: cursor } : { y: cursor }, id: child.id }));

      return cursor + spans[index].size + gap;
    }, start);
    dispatch(endHistoryGesture());
  }
};
