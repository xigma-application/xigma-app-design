// others
import { OFFSET_VECTOR_DEFAULT_DISTANCE } from 'components/Design/Toolbar/OffsetVectorToolbar/constants';

// store
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { setOffsetVector } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { isOffsetVectorNode } from 'utils/canvas/offsetVector/isOffsetVectorNode';

export type TUseStartOffsetVectorResult = {
  canStart: boolean;
  onStart: TFunc;
};

export const useStartOffsetVector = (): TUseStartOffsetVectorResult => {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const nodes = useAppSelector(selectNodes);

  return {
    canStart: selectedIds.length === 1 && isOffsetVectorNode(nodes[selectedIds[0]]),
    onStart: () => dispatch(setOffsetVector({ distance: OFFSET_VECTOR_DEFAULT_DISTANCE, join: StrokeJoin.miter, nodeId: selectedIds[0] })),
  };
};
