// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridLayoutSyncPositions } from '../getGridLayoutSyncPositions';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const sizes = [
  { height: 20, id: 'a', width: 20 },
  { height: 20, id: 'b', width: 20 },
  { height: 20, id: 'c', width: 20 },
  { height: 20, id: 'd', width: 20 },
];

describe('getGridLayoutSyncPositions', () => {
  it('should read the column count, gaps and padding off the frame and lay out a 2x2 grid', () => {
    const layoutFrame = frame({
      gridColumnCount: 2,
      height: 230,
      horizontalGap: 20,
      paddingLeft: 10,
      paddingTop: 10,
      verticalGap: 20,
      width: 230,
    });

    const positions = getGridLayoutSyncPositions(layoutFrame, sizes);

    expect(positions.map(({ id, x, y }) => ({ id, x, y }))).toEqual([
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 130, y: 10 },
      { id: 'c', x: 10, y: 130 },
      { id: 'd', x: 130, y: 130 },
    ]);
  });

  it('should treat a missing column count as a single column', () => {
    const layoutFrame = frame({ height: 300, width: 100 });

    const positions = getGridLayoutSyncPositions(layoutFrame, sizes);

    expect(positions.map(({ x }) => x)).toEqual([0, 0, 0, 0]);
  });

  it('should map horizontalGap to the column gap and verticalGap to the row gap', () => {
    const layoutFrame = frame({ gridColumnCount: 2, height: 210, horizontalGap: 40, verticalGap: 10, width: 240 });

    const positions = getGridLayoutSyncPositions(layoutFrame, sizes);
    const [a, b, , d] = positions;

    expect(b.x - a.x).toBe(140);
    expect(d.y - a.y).toBe(110);
  });

  it('should hug the frame to its grid content when the frame is set to hug', () => {
    const layoutFrame = frame({ gridColumnCount: 2, heightSizingMode: SizingMode.hug, horizontalGap: 10, widthSizingMode: SizingMode.hug });

    getGridLayoutSyncPositions(layoutFrame, [
      { height: 30, id: 'a', width: 25 },
      { height: 40, id: 'b', width: 35 },
    ]);

    expect(layoutFrame).toMatchObject({ height: 40, width: 70 });
  });
});
