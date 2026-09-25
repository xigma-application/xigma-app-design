// store
import { AppDispatch } from 'store';

// utils
import { commitShapeCornerRadius } from '../commitShapeCornerRadius';
import { makeEllipse } from '../../../../../Arc/hooks/utils/test/fixtures';

describe('commitShapeCornerRadius', () => {
  it('should set each ellipse corner radius, never below 0', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    commitShapeCornerRadius(dispatch, [makeEllipse({ cornerRadius: 4 })], (node) => (node.cornerRadius ?? 0) - 10);

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { cornerRadius: 0 }, id: 'ellipse' } }));
  });
});
