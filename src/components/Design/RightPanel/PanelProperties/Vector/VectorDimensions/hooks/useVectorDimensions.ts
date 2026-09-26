import { FocusEvent } from 'react';

// hooks
import { useDimensionsCommit } from '../../../Common/ColumnDimensions/hooks/useDimensionsCommit';

// others
import { MIXED_LABEL } from '../../../Common/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getLockedDimensionsChanges } from '../../../Common/ColumnDimensions/utils/getLockedDimensionsChanges';
import { getMixedOrValue } from '../../../Common/utils/getMixedOrValue';
import { getRoundedVectorSizes } from '../utils/getRoundedVectorSizes';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { resizeVectorToDimensions } from '../utils/resizeVectorToDimensions';

export type TUseVectorDimensionsResult = {
  displayHeight: number | string;
  displayWidth: number | string;
  height: number;
  locked: boolean;
  onBlurHeight: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurWidth: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubHeight: TFunc<[number]>;
  onScrubWidth: TFunc<[number]>;
  onToggleLock: TFunc;
  width: number;
};

export const useVectorDimensions = (): TUseVectorDimensionsResult => {
  const dispatch = useAppDispatch();
  const vectors = useAppSelector(selectSelectedNodes).filter((node): node is TVectorNode => node?.type === NodeType.vector);
  const sizes = getRoundedVectorSizes(vectors);
  const width = sizes[0]?.width ?? 0;
  const height = sizes[0]?.height ?? 0;
  const mixedWidth = getMixedOrValue(sizes.map((size) => size.width));
  const mixedHeight = getMixedOrValue(sizes.map((size) => size.height));
  const displayWidth = mixedWidth === 'mixed' ? MIXED_LABEL : width;
  const displayHeight = mixedHeight === 'mixed' ? MIXED_LABEL : height;
  const locked = vectors.length > 0 && vectors.every((vector) => vector.lockedAspectRatio ?? false);

  const commitAxis =
    (axis: 'height' | 'width'): TFunc<[number]> =>
    (value): void => {
      const nodes: Record<string, TSceneNode> = selectNodes(store.getState());

      vectors.forEach(({ id }) => {
        const vector = nodes[id] as TVectorNode;
        const bounds = getVectorNodeBounds(vector);

        resizeVectorToDimensions(dispatch, vector, getLockedDimensionsChanges(axis, value, bounds.width, bounds.height, locked));
      });
    };

  const commitOnBlur =
    (commit: TFunc<[number]>): TFunc<[number]> =>
    (value): void => {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      commit(value);
      dispatch(endHistoryGesture());
    };

  const toggleLock = (): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    vectors.forEach(({ id }) => dispatch(updateNode({ changes: { lockedAspectRatio: !locked }, id })));
    dispatch(endHistoryGesture());
  };

  return {
    displayHeight,
    displayWidth,
    height,
    locked,
    onBlurHeight: useDimensionsCommit(displayHeight, commitOnBlur(commitAxis('height'))),
    onBlurWidth: useDimensionsCommit(displayWidth, commitOnBlur(commitAxis('width'))),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubHeight: commitAxis('height'),
    onScrubWidth: commitAxis('width'),
    onToggleLock: toggleLock,
    width,
  };
};
