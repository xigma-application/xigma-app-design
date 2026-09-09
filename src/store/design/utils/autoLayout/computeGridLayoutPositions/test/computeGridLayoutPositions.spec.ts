// types
import { LayoutVersion, NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { computeGridLayoutPositions } from '../computeGridLayoutPositions';

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
  input: Partial<Parameters<typeof computeGridLayoutPositions>[0]> = {},
): TAutoLayoutChildPosition[] =>
  computeGridLayoutPositions({
    autoPlacement: true,
    columnCount: 2,
    columnGap: 0,
    frame: frameNode,
    layoutVersion: LayoutVersion.updated,
    padding: NO_PADDING,
    rowGap: 0,
    sizes,
    ...input,
  });

describe('computeGridLayoutPositions', () => {
  it('should lay four children into a 2x2 grid, splitting the frame evenly across equal fill tracks', () => {
    const positions = run(frame({ height: 200, width: 200 }), [child('a'), child('b'), child('c'), child('d')]);

    expect(positions.map(({ id, x, y }) => ({ id, x, y }))).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 0, y: 100 },
      { id: 'd', x: 100, y: 100 },
    ]);
  });

  it('should offset the tracks by the column and row gaps', () => {
    const positions = run(frame({ height: 220, width: 220 }), [child('a'), child('b'), child('c'), child('d')], {
      columnGap: 20,
      rowGap: 20,
    });

    expect(positions.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 0, y: 0 },
      { x: 120, y: 0 },
      { x: 0, y: 120 },
      { x: 120, y: 120 },
    ]);
  });

  it('should inset the whole grid by the padding', () => {
    const positions = run(frame({ height: 240, width: 240 }), [child('a'), child('b')], {
      padding: { paddingBottom: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 20 },
    });

    expect(positions.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 20, y: 20 },
      { x: 120, y: 20 },
    ]);
  });

  it('should give a fixed column its width and hand the remainder to the fill column', () => {
    const positions = run(frame({ height: 100, width: 200 }), [child('a'), child('b')], {
      columnSizes: [
        { mode: SizingMode.fixed, value: 60 },
        { mode: SizingMode.fill, value: 1 },
      ],
    });

    expect(positions.map(({ id, x, width }) => ({ id, width, x }))).toEqual([
      { id: 'a', width: 20, x: 0 },
      { id: 'b', width: 20, x: 60 },
    ]);
  });

  it('should size a hug row to the tallest child on that row', () => {
    const positions = run(
      frame({ height: 300, width: 200 }),
      [child('a', { height: 40 }), child('b', { height: 80 }), child('c', { height: 10 })],
      { rowSizes: [{ mode: SizingMode.hug }, { mode: SizingMode.hug }] },
    );

    expect(positions.map(({ id, y }) => ({ id, y }))).toEqual([
      { id: 'a', y: 0 },
      { id: 'b', y: 0 },
      { id: 'c', y: 80 },
    ]);
  });

  it('should stretch a fill child to its cell', () => {
    const positions = run(frame({ height: 100, width: 200 }), [
      child('a', { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }),
      child('b'),
    ]);

    expect(positions[0]).toMatchObject({ height: 100, id: 'a', width: 100, x: 0, y: 0 });
  });

  it('should grow a width-hug frame to the sum of its column tracks, gaps and padding', () => {
    const layoutFrame = frame({ width: 999, widthSizingMode: SizingMode.hug });

    run(layoutFrame, [child('a', { width: 30 }), child('b', { width: 50 })], {
      columnGap: 10,
      padding: { paddingBottom: 0, paddingLeft: 5, paddingRight: 5, paddingTop: 0 },
    });

    expect(layoutFrame.width).toBe(100);
  });

  it('should grow a height-hug frame to the sum of its row tracks and clamp it to maxHeight', () => {
    const layoutFrame = frame({ height: 999, heightSizingMode: SizingMode.hug, maxHeight: 30 });

    run(layoutFrame, [child('a', { height: 40 }), child('b'), child('c', { height: 25 })], { rowGap: 5 });

    expect(layoutFrame.height).toBe(30);
  });

  it('should honour an explicit row count larger than the number of occupied rows', () => {
    const layoutFrame = frame({ height: 999, heightSizingMode: SizingMode.hug });

    run(layoutFrame, [child('a', { height: 20 }), child('b', { height: 20 })], { rowCount: 4, rowGap: 10 });

    expect(layoutFrame.height).toBe(20 + 0 + 0 + 0 + 10 * 3);
  });

  it('should not shrink a fixed frame below its padding under the updated engine', () => {
    const layoutFrame = frame({ height: 10, width: 10 });

    run(layoutFrame, [child('a')], { padding: { paddingBottom: 15, paddingLeft: 15, paddingRight: 15, paddingTop: 15 } });

    expect(layoutFrame).toMatchObject({ height: 30, width: 30 });
  });

  it('should not contribute a spanning child to any single track hug size', () => {
    const layoutFrame = frame({ width: 999, widthSizingMode: SizingMode.hug });

    run(layoutFrame, [child('a', { gridColumnSpan: 2, width: 300 }), child('b', { width: 40 }), child('c', { width: 40 })], {
      columnSizes: [{ mode: SizingMode.hug }, { mode: SizingMode.hug }],
    });

    expect(layoutFrame.width).toBe(80);
  });
});
