// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';

// utils
import { getAutoLayoutWorldDropTarget } from '../getAutoLayoutWorldDropTarget';

const rotatedMock = vi.fn(() => 'rotated-positions');

vi.mock('store/design/utils/autoLayout/getAutoLayoutRotatedPositions', () => ({
  getAutoLayoutRotatedPositions: (...args: unknown[]): unknown => rotatedMock(...(args as [])),
}));

describe('getAutoLayoutWorldDropTarget', () => {
  it('should rotate the sibling positions of the drop target into world space', () => {
    // mock
    const dropTarget = { index: 2, siblingPositions: { a: { x: 0, y: 0 } } } as unknown as TAutoLayoutDropTarget;
    const sizes = [{ id: 'a' }] as unknown as TAutoLayoutChildSize[];

    // result
    expect(getAutoLayoutWorldDropTarget(dropTarget, sizes, { x: 1, y: 1 }, 45)).toEqual({
      index: 2,
      siblingPositions: 'rotated-positions',
    });
    expect(rotatedMock).toHaveBeenCalledWith({ a: { x: 0, y: 0 } }, { a: sizes[0] }, { x: 1, y: 1 }, 45);
  });
});
