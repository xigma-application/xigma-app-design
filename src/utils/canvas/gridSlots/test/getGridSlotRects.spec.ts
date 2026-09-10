// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridSlotRects } from '../getGridSlotRects';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 2,
  gridRowCount: 2,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const child = (id: string): TSceneNode => ({
  childIds: [],
  clipContent: true,
  fill: '#000',
  height: 10,
  id,
  name: id,
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

describe('getGridSlotRects', () => {
  it('should split the frame into an even grid of cells', () => {
    // action
    const rects = getGridSlotRects(buildFrame(), {});

    // result
    expect(rects).toEqual([
      { height: 50, width: 100, x: 0, y: 0 },
      { height: 50, width: 100, x: 100, y: 0 },
      { height: 50, width: 100, x: 0, y: 50 },
      { height: 50, width: 100, x: 100, y: 50 },
    ]);
  });

  it('should subtract the column and row gaps from the cell sizes and add them to the offsets', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ horizontalGap: 20, verticalGap: 10 }), {});

    // result
    expect(rects).toEqual([
      { height: 45, width: 90, x: 0, y: 0 },
      { height: 45, width: 90, x: 110, y: 0 },
      { height: 45, width: 90, x: 0, y: 55 },
      { height: 45, width: 90, x: 110, y: 55 },
    ]);
  });

  it('should inset the grid by the frame padding and offset it by the frame position', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingTop: 10, x: 5, y: 7 }), {});

    // result
    expect(rects).toEqual([
      { height: 40, width: 90, x: 15, y: 17 },
      { height: 40, width: 90, x: 105, y: 17 },
      { height: 40, width: 90, x: 15, y: 57 },
      { height: 40, width: 90, x: 105, y: 57 },
    ]);
  });

  it('should derive the row count from the child count when gridRowCount is not set', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ childIds: ['a', 'b', 'c'], gridRowCount: undefined }), {
      a: child('a'),
      b: child('b'),
      c: child('c'),
    });

    // result — 3 children over 2 columns => 2 rows
    expect(rects).toHaveLength(4);
    expect(rects[3]).toEqual({ height: 50, width: 100, x: 100, y: 50 });
  });

  it('should never render fewer rows than the children need, even with a smaller explicit gridRowCount', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ childIds: ['a', 'b', 'c', 'd', 'e'], gridRowCount: 1 }), {
      a: child('a'),
      b: child('b'),
      c: child('c'),
      d: child('d'),
      e: child('e'),
    });

    // result — 5 children over 2 columns => 3 rows minimum
    expect(rects).toHaveLength(6);
  });

  it('should default to a single column when gridColumnCount is not set', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ gridColumnCount: undefined, gridRowCount: 1 }), {});

    // result
    expect(rects).toEqual([{ height: 100, width: 200, x: 0, y: 0 }]);
  });

  it('should clamp the cell size to zero when the padding leaves no room', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ paddingLeft: 150, paddingRight: 150 }), {});

    // result
    expect(rects.every((rect) => rect.width === 0)).toBe(true);
  });

  it('should ignore child ids that no longer resolve to a node', () => {
    // action
    const rects = getGridSlotRects(buildFrame({ childIds: ['a', 'ghost'], gridRowCount: undefined }), { a: child('a') });

    // result — only one real child over 2 columns => 1 row
    expect(rects).toHaveLength(2);
  });
});
