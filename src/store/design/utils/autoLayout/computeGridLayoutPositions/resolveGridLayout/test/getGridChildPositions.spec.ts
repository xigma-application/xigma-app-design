// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';
import { TGridCellPlacement } from '../../types';

// utils
import { getGridChildPositions, TGetGridChildPositionsInput } from '../getGridChildPositions';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

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

const placement = (id: string, columnStart: number, rowStart: number): TGridCellPlacement => ({
  columnSpan: 1,
  columnStart,
  id,
  rowSpan: 1,
  rowStart,
});

const size = (id: string, overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 20,
  id,
  width: 20,
  ...overrides,
});

const run = (overrides: Partial<TGetGridChildPositionsInput> = {}): TAutoLayoutChildPosition[] =>
  getGridChildPositions({
    columnGap: 0,
    columnTrackSizes: [40, 60],
    frame: frame(),
    padding: NO_PADDING,
    placements: [placement('a', 0, 0), placement('b', 1, 0), placement('c', 0, 1), placement('d', 1, 1)],
    rowGap: 0,
    rowTrackSizes: [30, 50],
    sizes: [size('a'), size('b'), size('c'), size('d')],
    ...overrides,
  });

describe('getGridChildPositions behaviors', () => {
  it('should place each child at the offset of its grid track', () => {
    // before
    const positions = run();

    // result
    expect(positions.map(({ id, x, y }) => ({ id, x, y }))).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 40, y: 0 },
      { id: 'c', x: 0, y: 30 },
      { id: 'd', x: 40, y: 30 },
    ]);
  });

  it('should inset the whole grid by the content box origin', () => {
    // before
    const positions = run({
      frame: frame({ x: 10, y: 5 }),
      padding: { paddingBottom: 0, paddingLeft: 10, paddingRight: 0, paddingTop: 10 },
    });

    // result
    expect(positions[0]).toMatchObject({ id: 'a', x: 20, y: 15 });
  });

  it('should push the following tracks along by the gaps', () => {
    // before
    const positions = run({ columnGap: 8, rowGap: 6 });

    // result
    expect(positions.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 0, y: 0 },
      { x: 48, y: 0 },
      { x: 0, y: 36 },
      { x: 48, y: 36 },
    ]);
  });

  it('should stretch a fill child to its cell rect', () => {
    // before
    const positions = run({
      sizes: [size('a', { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }), size('b'), size('c'), size('d')],
    });

    // result
    expect(positions[0]).toMatchObject({ height: 30, id: 'a', width: 40, x: 0, y: 0 });
  });
});
