// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAutoLayoutWorldDraggedBlock } from '../getAutoLayoutWorldDraggedBlock';

const rotatedMock = vi.fn(() => 'rotated-slots');

vi.mock('store/design/utils/autoLayout/getAutoLayoutRotatedPositions', () => ({
  getAutoLayoutRotatedPositions: (...args: unknown[]): unknown => rotatedMock(...(args as [])),
}));

const sizes = [{ id: 'size-a' }, { id: 'size-b' }] as unknown as TAutoLayoutChildSize[];

describe('getAutoLayoutWorldDraggedBlock', () => {
  it('should rotate the dragged member slots into world space, sized by the moved ids in order', () => {
    // mock
    const block = { draggedGrabbedId: 'a', draggedMemberSlots: { a: { x: 0, y: 0 } } } as never;

    // before
    const result = getAutoLayoutWorldDraggedBlock(block, ['a', 'b'], sizes, { x: 5, y: 5 }, 30);

    // result
    expect(result).toEqual({ draggedGrabbedId: 'a', draggedMemberSlots: 'rotated-slots' });
    expect(rotatedMock).toHaveBeenCalledWith({ a: { x: 0, y: 0 } }, { a: sizes[0], b: sizes[1] }, { x: 5, y: 5 }, 30);
  });

  it('should pass through a block without member slots or no block at all', () => {
    // mock
    const block = { draggedGrabbedId: 'a' } as never;

    // result
    expect(getAutoLayoutWorldDraggedBlock(block, [], [], { x: 0, y: 0 }, 0)).toBe(block);
    expect(getAutoLayoutWorldDraggedBlock(undefined, [], [], { x: 0, y: 0 }, 0)).toBeUndefined();
  });
});
