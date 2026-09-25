// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getNearestPathOffsetAtPoint } from '../getNearestPathOffsetAtPoint';

const nearestOffsetAtPointMock = vi.fn();

vi.mock('../../text/pathSampler/getTextPathSampler', () => ({
  getTextPathSampler: (): unknown => ({ nearestOffsetAtPoint: nearestOffsetAtPointMock }),
}));
vi.mock('../../text/flipTextPoint', () => ({ flipTextPoint: (point: unknown): unknown => point }));

describe('getNearestPathOffsetAtPoint', () => {
  it('should unrotate the point around the box center and return the nearest offset along the path', () => {
    // mock
    const box = { height: 20, rotation: 90, width: 20, x: 0, y: 0 } as TEditingTextBox;
    nearestOffsetAtPointMock.mockReturnValue({ offset: 42 });

    // before
    const offset = getNearestPathOffsetAtPoint({ x: 20, y: 10 }, box);
    const [local] = nearestOffsetAtPointMock.mock.calls[0];

    // result
    expect(offset).toBe(42);
    expect(local.x).toBeCloseTo(10);
    expect(local.y).toBeCloseTo(0);
  });
});
