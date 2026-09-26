// store
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSelectedVectorPointsEntry } from '../types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSelectedVectorPositionPoints } from './getSelectedVectorPositionPoints';
import { getVectorPointsPosition } from './getVectorPointsPosition';
import { getVectorPointsPositionTarget } from './getVectorPointsPositionTarget';
import { translateVectorHandles } from './translateVectorHandles';
import { translateVectorPoints } from './translateVectorPoints';

export const commitVectorSelectionPosition = (
  dispatch: AppDispatch,
  entries: TSelectedVectorPointsEntry[],
  axis: 'x' | 'y',
  value: number,
): void => {
  const nodes = selectNodes(store.getState());
  const freshEntries = entries.map((entry) => ({ ...entry, node: nodes[entry.node.id] as TVectorNode }));
  const points = freshEntries.flatMap(({ handles, node, vertexIds }) => getSelectedVectorPositionPoints(node, vertexIds, handles));
  const delta = getVectorPointsPositionTarget(getVectorPointsPosition(freshEntries[0].node, points, nodes), axis, value);

  freshEntries.forEach(({ handles, node, vertexIds }) => {
    if (vertexIds.length > 0) {
      translateVectorPoints(dispatch, node, vertexIds, delta);
    } else {
      translateVectorHandles(dispatch, node, handles, delta);
    }
  });
};
