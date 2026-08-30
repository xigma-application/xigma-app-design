// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getVectorWidthLabelAtPoint } from '../getVectorWidthLabelAtPoint';

const getVectorWidthLabelRectsMock = vi.fn();

vi.mock('../getVectorWidthLabelRects', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../getVectorWidthLabelRects')>()),
  getVectorWidthLabelRects: (...args: unknown[]): unknown => getVectorWidthLabelRectsMock(...args),
}));

const refs = {} as TCanvasRefs;
const nodes = {};

const rect = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  badgeHeight: 24,
  badgeWidth: 22,
  center: { x: 20, y: -34 },
  segmentId: 's1',
  t: 0.2,
  target: { nodeId: 'node-1', point: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 }, side: 'right' },
  ...overrides,
});

describe('getVectorWidthLabelAtPoint', () => {
  beforeEach(() => {
    getVectorWidthLabelRectsMock.mockReset();
  });

  it('should return null when no label rect contains the point', () => {
    // mock
    getVectorWidthLabelRectsMock.mockReturnValue([rect()]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: 100 }, nodes, refs, 1);

    // result
    expect(result).toBeNull();
  });

  it('should return the containing rect’s node/segment/t when the point is inside the badge', () => {
    // mock
    getVectorWidthLabelRectsMock.mockReturnValue([rect()]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: -34 }, nodes, refs, 1);

    // result
    expect(result).toEqual({ nodeId: 'node-1', segmentId: 's1', t: 0.2 });
  });

  it('should return the first rect that contains the point', () => {
    // mock
    getVectorWidthLabelRectsMock.mockReturnValue([
      rect({ center: { x: 200, y: 200 } }),
      rect({ segmentId: 's2', t: 0.7, target: { nodeId: 'node-2', point: { id: 'p2' }, side: 'left' } }),
    ]);

    // before
    const result = getVectorWidthLabelAtPoint({ x: 20, y: -34 }, nodes, refs, 1);

    // result
    expect(result).toEqual({ nodeId: 'node-2', segmentId: 's2', t: 0.7 });
  });
});
