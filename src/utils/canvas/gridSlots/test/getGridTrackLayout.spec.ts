// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridTrackLayout } from '../getGridTrackLayout';

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
  fill: '#000',
  height: 10,
  id,
  name: id,
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('getGridTrackLayout', () => {
  it('should split the content area evenly across the tracks', () => {
    // action
    const layout = getGridTrackLayout(buildFrame(), {});

    // result
    expect(layout).toEqual({
      columnCount: 2,
      columnGap: 0,
      columnSize: 100,
      padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
      rowCount: 2,
      rowGap: 0,
      rowSize: 50,
    });
  });

  it('should account for gaps and padding in the track sizes', () => {
    // action
    const layout = getGridTrackLayout(buildFrame({ horizontalGap: 20, paddingLeft: 10, paddingRight: 10, verticalGap: 10 }), {});

    // result — width 200 - 20 padding - 20 gap = 160 over 2 cols = 80
    expect(layout.columnSize).toBe(80);
    expect(layout.rowSize).toBe(45);
    expect(layout.columnGap).toBe(20);
    expect(layout.padding.paddingLeft).toBe(10);
  });

  it('should derive the row count from the child count when gridRowCount is unset', () => {
    // action
    const layout = getGridTrackLayout(buildFrame({ childIds: ['a', 'b', 'c'], gridRowCount: undefined }), {
      a: child('a'),
      b: child('b'),
      c: child('c'),
    });

    // result — 3 children over 2 columns => 2 rows
    expect(layout.rowCount).toBe(2);
  });

  it('should never fall below the row count the children need', () => {
    // action
    const layout = getGridTrackLayout(buildFrame({ childIds: ['a', 'b', 'c', 'd', 'e'], gridRowCount: 1 }), {
      a: child('a'),
      b: child('b'),
      c: child('c'),
      d: child('d'),
      e: child('e'),
    });

    // result — 5 children over 2 columns => 3 rows
    expect(layout.rowCount).toBe(3);
  });

  it('should default to a single column and clamp negative sizes to zero', () => {
    // action
    const layout = getGridTrackLayout(buildFrame({ gridColumnCount: undefined, gridRowCount: 1, paddingLeft: 300 }), {});

    // result
    expect(layout.columnCount).toBe(1);
    expect(layout.columnSize).toBe(0);
  });
});
