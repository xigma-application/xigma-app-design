// store
import { AppDispatch } from 'store';
import { setOffsetVector } from 'store/design/slice';

// types
import { StrokeJoin } from 'types/design/enums';
import { TOffsetVectorState } from 'store/design/types';

export const changeOffsetVectorJoin = (dispatch: AppDispatch, offsetVector: TOffsetVectorState | null, join: string): void => {
  if (offsetVector) {
    dispatch(setOffsetVector({ ...offsetVector, join: join === StrokeJoin.round ? StrokeJoin.round : StrokeJoin.miter }));
  }
};
