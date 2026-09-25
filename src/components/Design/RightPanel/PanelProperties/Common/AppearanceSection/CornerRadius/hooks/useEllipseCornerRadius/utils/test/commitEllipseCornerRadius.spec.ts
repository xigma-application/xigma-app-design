// store
import { AppDispatch } from 'store';

// utils
import { commitEllipseCornerRadius } from '../commitEllipseCornerRadius';
import { makeEllipse } from '../../../../../Arc/hooks/utils/test/fixtures';

describe('commitEllipseCornerRadius', () => {
  it('should set each ellipse corner radius, never below 0', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    commitEllipseCornerRadius(dispatch, [makeEllipse({ cornerRadius: 4 })], (node) => (node.cornerRadius ?? 0) - 10);

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { cornerRadius: 0 }, id: 'ellipse' } }));
  });
});
