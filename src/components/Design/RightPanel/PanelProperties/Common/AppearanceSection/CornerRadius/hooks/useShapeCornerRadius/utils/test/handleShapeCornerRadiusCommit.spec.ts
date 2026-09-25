// store
import { AppDispatch } from 'store';

// utils
import { handleShapeCornerRadiusCommit } from '../handleShapeCornerRadiusCommit';
import { makeEllipse } from '../../../../../Arc/hooks/utils/test/fixtures';

describe('handleShapeCornerRadiusCommit', () => {
  it('should set the typed corner radius on each ellipse', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    handleShapeCornerRadiusCommit(dispatch, [makeEllipse({ cornerRadius: 4 })], '12');

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { cornerRadius: 12 }, id: 'ellipse' } }));
  });

  it('should ignore invalid input', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    handleShapeCornerRadiusCommit(dispatch, [makeEllipse({ cornerRadius: 4 })], 'abc');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
