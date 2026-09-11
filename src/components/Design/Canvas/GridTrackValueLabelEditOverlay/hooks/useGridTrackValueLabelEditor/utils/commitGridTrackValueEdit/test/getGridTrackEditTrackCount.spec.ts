// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridTrackEditTrackCount } from '../getGridTrackEditTrackCount';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    gridColumnCount: 2,
    height: 200,
    id: 'grid-1',
    layoutMode: LayoutMode.grid,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TFrameNode;

const child = (id: string): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('getGridTrackEditTrackCount', () => {
  it('should return the rounded column count on the column axis', () => {
    // action
    const result = getGridTrackEditTrackCount(frame({ gridColumnCount: 3.6 }), {}, 'column');

    // result
    expect(result).toBe(4);
  });

  it('should default to a single column when the column count is missing', () => {
    // action
    const result = getGridTrackEditTrackCount(frame({ gridColumnCount: undefined }), {}, 'column');

    // result
    expect(result).toBe(1);
  });

  it('should return the rounded row count on the row axis when it is set explicitly', () => {
    // action
    const result = getGridTrackEditTrackCount(frame({ gridRowCount: 2.4 }), {}, 'row');

    // result
    expect(result).toBe(2);
  });

  it('should derive the row count from the children when it is not set explicitly', () => {
    // mock
    const nodes = { a: child('a'), b: child('b'), c: child('c') };

    // action
    const result = getGridTrackEditTrackCount(frame({ childIds: ['a', 'b', 'c'], gridRowCount: undefined }), nodes, 'row');

    // result
    // 3 children over 2 columns => 2 rows
    expect(result).toBe(2);
  });

  it('should clamp the count to a minimum of one', () => {
    // action
    const result = getGridTrackEditTrackCount(frame({ gridColumnCount: 0 }), {}, 'column');

    // result
    expect(result).toBe(1);
  });
});
