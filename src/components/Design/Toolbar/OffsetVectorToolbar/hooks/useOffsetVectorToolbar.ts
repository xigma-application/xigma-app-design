// others
import { OFFSET_VECTOR_DEFAULT_DISTANCE } from '../constants';

// store
import { selectNodes, selectOffsetVector } from 'store/design/selectors';
import { setOffsetVector } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { changeOffsetVectorDistance } from '../utils/changeOffsetVectorDistance';
import { changeOffsetVectorJoin } from '../utils/changeOffsetVectorJoin';
import { commitOffsetVector } from '../utils/commitOffsetVector';
import { isOffsetVectorNode } from 'utils/canvas/offsetVector/isOffsetVectorNode';

export type TUseOffsetVectorToolbarResult = {
  distance: number;
  isVisible: boolean;
  join: StrokeJoin;
  onCancel: TFunc;
  onConfirm: TFunc;
  onDistanceChange: TFunc<[number]>;
  onJoinChange: TFunc<[string]>;
};

export const useOffsetVectorToolbar = (): TUseOffsetVectorToolbarResult => {
  const dispatch = useAppDispatch();
  const offsetVector = useAppSelector(selectOffsetVector);
  const nodes = useAppSelector(selectNodes);

  return {
    distance: offsetVector?.distance ?? OFFSET_VECTOR_DEFAULT_DISTANCE,
    isVisible: offsetVector !== null && isOffsetVectorNode(nodes[offsetVector.nodeId]),
    join: offsetVector?.join ?? StrokeJoin.miter,
    onCancel: () => dispatch(setOffsetVector(null)),
    onConfirm: () => commitOffsetVector(dispatch),
    onDistanceChange: (distance) => changeOffsetVectorDistance(dispatch, offsetVector, distance),
    onJoinChange: (join) => changeOffsetVectorJoin(dispatch, offsetVector, join),
  };
};
