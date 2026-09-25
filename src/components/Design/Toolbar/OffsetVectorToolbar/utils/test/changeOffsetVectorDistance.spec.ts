// store
import { AppDispatch } from 'store';
import { setOffsetVector } from 'store/design/slice';

// types
import { StrokeJoin } from 'types/design/enums';
import { TOffsetVectorState } from 'store/design/types';

// utils
import { changeOffsetVectorDistance } from '../changeOffsetVectorDistance';

const state: TOffsetVectorState = { distance: 20, join: StrokeJoin.miter, nodeId: 'node' };
const dispatch = vi.fn() as unknown as AppDispatch;

describe('changeOffsetVectorDistance', () => {
  beforeEach(() => {
    vi.mocked(dispatch).mockClear();
  });

  it('should keep the distance at 0 or more', () => {
    // before
    changeOffsetVectorDistance(dispatch, state, -5);

    // result
    expect(dispatch).toHaveBeenCalledWith(setOffsetVector({ ...state, distance: 0 }));
  });

  it('should do nothing without an offset in progress', () => {
    // before
    changeOffsetVectorDistance(dispatch, null, 5);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
