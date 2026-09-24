// store
import { AppDispatch } from 'store';

// types
import { TDistributeAxis } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAxisSpan } from './getAxisSpan';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { translateNodeSubtree } from './translateNodeSubtree';

export const distributeNodes = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  items: TSceneNode[],
  axis: TDistributeAxis,
): void => {
  const entries = items
    .map((node) => ({ node, span: getAxisSpan(getRotatedNodeBounds(node), axis) }))
    .sort((a, b) => a.span.start - b.span.start);
  const start = Math.min(...entries.map(({ span }) => span.start));
  const end = Math.max(...entries.map(({ span }) => span.start + span.size));
  const totalSize = entries.reduce((sum, { span }) => sum + span.size, 0);
  const gap = (end - start - totalSize) / (entries.length - 1);

  entries.reduce((cursor, { node, span }) => {
    const delta = cursor - span.start;

    translateNodeSubtree(dispatch, nodes, node, axis === 'horizontal' ? delta : 0, axis === 'vertical' ? delta : 0);

    return cursor + span.size + gap;
  }, start);
};
