// store
import { AppDispatch } from 'store';
import { setOffsetVector } from 'store/design/slice';

// types
import { StrokeJoin } from 'types/design/enums';
import { TOffsetVectorState } from 'store/design/types';

// utils
import { changeOffsetVectorJoin } from '../changeOffsetVectorJoin';

const state: TOffsetVectorState = { distance: 20, join: StrokeJoin.miter, nodeId: 'node' };
const dispatch = vi.fn() as unknown as AppDispatch;

describe('changeOffsetVectorJoin', () => {
  beforeEach(() => {
    vi.mocked(dispatch).mockClear();
  });

  it('should switch to round corners', () => {
    // before
    changeOffsetVectorJoin(dispatch, state, StrokeJoin.round);

    // result
    expect(dispatch).toHaveBeenCalledWith(setOffsetVector({ ...state, join: StrokeJoin.round }));
  });

  it('should fall back to sharp corners for any other join', () => {
    // before
    changeOffsetVectorJoin(dispatch, { ...state, join: StrokeJoin.round }, StrokeJoin.bevel);

    // result
    expect(dispatch).toHaveBeenCalledWith(setOffsetVector({ ...state, join: StrokeJoin.miter }));
  });

  it('should do nothing without an offset in progress', () => {
    // before
    changeOffsetVectorJoin(dispatch, null, StrokeJoin.round);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
