// store
import { dispatchAsOneGestureIfMultiNode } from 'components/Design/Canvas/utils/dispatchAsOneGestureIfMultiNode';
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';
import { TSelectionColorOccurrence } from '../types';

// utils
import { getSelectionColorNodeChanges } from './getSelectionColorNodeChanges';

export const commitSelectionColorChange = (
  dispatch: AppDispatch,
  nodesById: Record<string, TSceneNode>,
  occurrences: TSelectionColorOccurrence[],
  nextPaint: TSolidPaint | TGradientPaint,
): void => {
  const nodeChanges = getSelectionColorNodeChanges(nodesById, occurrences, nextPaint);

  dispatchAsOneGestureIfMultiNode(dispatch, nodeChanges.length, () =>
    nodeChanges.forEach(({ changes, nodeId }) => dispatch(updateNode({ changes, id: nodeId }))),
  );
};
