// store
import { AppDispatch } from 'store';
import { setOffsetVector } from 'store/design/slice';

// types
import { TOffsetVectorState } from 'store/design/types';

export const changeOffsetVectorDistance = (dispatch: AppDispatch, offsetVector: TOffsetVectorState | null, distance: number): void => {
  if (offsetVector) {
    dispatch(setOffsetVector({ ...offsetVector, distance: Math.max(0, distance) }));
  }
};
