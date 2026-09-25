// others
import { OFFSET_VECTOR_DEFAULT_DISTANCE } from 'components/Design/Toolbar/OffsetVectorToolbar/constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { setOffsetVector } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeJoin } from 'types/design/enums';

export type TUseStartOffsetVectorResult = {
  canStart: boolean;
  onStart: TFunc;
};

export const useStartOffsetVector = (): TUseStartOffsetVectorResult => {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);

  return {
    canStart: selectedIds.length === 1,
    onStart: () => dispatch(setOffsetVector({ distance: OFFSET_VECTOR_DEFAULT_DISTANCE, join: StrokeJoin.miter, nodeId: selectedIds[0] })),
  };
};
