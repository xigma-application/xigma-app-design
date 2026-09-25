// others
import { OFFSET_VECTOR_DEFAULT_DISTANCE } from '../constants';

// store
import { selectNodes, selectOffsetVector } from 'store/design/selectors';
import { setOffsetVector } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { commitOffsetVector } from '../utils/commitOffsetVector';
import { isLineNode } from 'utils/canvas/line/isLineNode';

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
    isVisible: offsetVector !== null && isLineNode(nodes[offsetVector.nodeId]),
    join: offsetVector?.join ?? StrokeJoin.miter,
    onCancel: () => dispatch(setOffsetVector(null)),
    onConfirm: () => commitOffsetVector(dispatch),
    onDistanceChange: (distance) => {
      if (offsetVector) {
        dispatch(setOffsetVector({ ...offsetVector, distance: Math.max(0, distance) }));
      }
    },
    onJoinChange: (join) => {
      if (offsetVector) {
        dispatch(setOffsetVector({ ...offsetVector, join: join === StrokeJoin.round ? StrokeJoin.round : StrokeJoin.miter }));
      }
    },
  };
};
