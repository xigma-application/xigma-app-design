// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { resolveGridLayout, TResolveGridLayoutInput } from '../resolveGridLayout';

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

const child = (id: string, overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 20,
  id,
  width: 20,
  ...overrides,
});

const run = (
  frameNode: TFrameNode,
  sizes: TAutoLayoutChildSize[],
  overrides: Partial<TResolveGridLayoutInput> = {},
): TAutoLayoutChildPosition[] =>
  resolveGridLayout({
    autoPlacement: true,
    columnCount: 2,
    columnGap: 0,
    frame: frameNode,
    isHeightHug: false,
    isWidthHug: false,
    padding: NO_PADDING,
    rowGap: 0,
    sizes,
    ...overrides,
  });

describe('resolveGridLayout behaviors', () => {
  it('should lay four children into a 2x2 grid split evenly across equal fill tracks', () => {
    // before
    const positions = run(frame({ height: 200, width: 200 }), [child('a'), child('b'), child('c'), child('d')]);

    // result
    expect(positions.map(({ id, x, y }) => ({ id, x, y }))).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 0, y: 100 },
      { id: 'd', x: 100, y: 100 },
    ]);
  });

  it('should derive the row count from the placed cells', () => {
    // before
    const positions = run(frame({ height: 300, width: 200 }), [child('a'), child('b'), child('c'), child('d'), child('e')]);

    // result
    expect(positions.map(({ id, y }) => ({ id, y }))).toEqual([
      { id: 'a', y: 0 },
      { id: 'b', y: 0 },
      { id: 'c', y: 100 },
      { id: 'd', y: 100 },
      { id: 'e', y: 200 },
    ]);
  });

  it('should honour an explicit row count larger than the number of occupied rows', () => {
    // mock
    const layoutFrame = frame({ height: 999, width: 200 });

    // before
    run(layoutFrame, [child('a'), child('b')], { isHeightHug: true, rowCount: 4, rowGap: 10 });

    // result
    expect(layoutFrame.height).toBe(20 + 0 + 0 + 0 + 10 * 3);
  });

  it('should grow a width-hug frame to the sum of its column tracks, gaps and padding', () => {
    // mock
    const layoutFrame = frame({ width: 999 });

    // before
    run(layoutFrame, [child('a', { width: 30 }), child('b', { width: 50 })], {
      columnGap: 10,
      isWidthHug: true,
      padding: { paddingBottom: 0, paddingLeft: 5, paddingRight: 5, paddingTop: 0 },
    });

    // result
    expect(layoutFrame.width).toBe(100);
  });

  it('should stretch a fill child to its cell', () => {
    // before
    const positions = run(frame({ height: 100, width: 200 }), [
      child('a', { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }),
      child('b'),
    ]);

    // result
    expect(positions[0]).toMatchObject({ height: 100, id: 'a', width: 100, x: 0, y: 0 });
  });
});
