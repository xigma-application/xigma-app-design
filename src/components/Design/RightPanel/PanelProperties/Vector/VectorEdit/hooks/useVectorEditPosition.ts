import { FocusEvent } from 'react';

// hooks
import { usePositionCommit } from '../../../Common/PositionSection/ColumnPosition/hooks/usePositionCommit';
import { useSelectedVectorPoints } from './useSelectedVectorPoints';
import { useVectorPointsHistory } from './useVectorPointsHistory';

// store
import { selectNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { commitVectorSelectionPosition } from '../utils/commitVectorSelectionPosition';
import { getSelectedVectorPositionPoints } from '../utils/getSelectedVectorPositionPoints';
import { getVectorPointsPosition } from '../utils/getVectorPointsPosition';

export type TUseVectorEditPositionResult = {
  disabled: boolean;
  displayX: number | string;
  displayY: number | string;
  onBlurX: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurY: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubX: TFunc<[number]>;
  onScrubY: TFunc<[number]>;
  x: number;
  y: number;
};

export const useVectorEditPosition = (): TUseVectorEditPositionResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const history = useVectorPointsHistory();
  const entries = useSelectedVectorPoints().filter(({ handles, vertexIds }) => vertexIds.length + handles.length > 0);
  const points = entries.flatMap(({ handles, node, vertexIds }) => getSelectedVectorPositionPoints(node, vertexIds, handles));
  const position = entries.length > 0 ? getVectorPointsPosition(entries[0].node, points, nodes) : undefined;
  const x = position ? Math.round(position.x * 100) / 100 : 0;
  const y = position ? Math.round(position.y * 100) / 100 : 0;
  const displayX = position ? x : '';
  const displayY = position ? y : '';

  const commit =
    (axis: 'x' | 'y'): TFunc<[number]> =>
    (value): void =>
      commitVectorSelectionPosition(dispatch, entries, axis, value);

  return {
    disabled: !position,
    displayX,
    displayY,
    onBlurX: usePositionCommit(displayX, (value) => history.run(() => commit('x')(value))),
    onBlurY: usePositionCommit(displayY, (value) => history.run(() => commit('y')(value))),
    onDragEnd: history.end,
    onDragStart: history.begin,
    onScrubX: commit('x'),
    onScrubY: commit('y'),
    x,
    y,
  };
};
