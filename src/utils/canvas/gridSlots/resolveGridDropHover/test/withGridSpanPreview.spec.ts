// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropContext, TGridDropHover } from '../types';

// utils
import { withGridSpanPreview } from '../withGridSpanPreview';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['drag'],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 4,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 0,
  y: 0,
  ...overrides,
});

const dragNode = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id: 'drag',
    name: 'drag',
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const context = (node: TSceneNode, movedNodeIds = ['drag']): TGridDropContext => ({
  count: movedNodeIds.length,
  frame: frame(),
  movedNodeIds,
  nodesById: { drag: node },
});

const multiContext = (nodes: Record<string, TSceneNode>): TGridDropContext => ({
  count: Object.keys(nodes).length,
  frame: frame(),
  movedNodeIds: Object.keys(nodes),
  nodesById: nodes,
});

const hover = (cells: { column: number; row: number }[]): TGridDropHover => ({ cells });

describe('withGridSpanPreview', () => {
  it('should leave a plain 1x1 dragged node untouched', () => {
    const result = withGridSpanPreview(hover([{ column: 1, row: 0 }]), context(dragNode()), 4);

    expect(result.previewCells).toBeUndefined();
  });

  it('should leave an indicator hover untouched', () => {
    const result = withGridSpanPreview(
      { cells: [], indicator: { column: 0, row: 0, side: 'left' }, insertIndex: 0 },
      context(dragNode({ gridColumnSpan: 2 })),
      4,
    );

    expect(result.previewCells).toBeUndefined();
  });

  it('should leave a multi-node drag of only plain 1x1 children untouched', () => {
    const result = withGridSpanPreview(
      hover([
        { column: 0, row: 0 },
        { column: 1, row: 0 },
      ]),
      multiContext({ a: dragNode({ id: 'a' }), b: dragNode({ id: 'b' }) }),
      4,
    );

    expect(result.previewCells).toBeUndefined();
  });

  it('should union every dragged child’s footprint for a multi-node drag', () => {
    // "a" spans 2x2 anchored at (0,0); "b" is a plain cell at (2,0)
    const result = withGridSpanPreview(
      hover([
        { column: 0, row: 0 },
        { column: 2, row: 0 },
      ]),
      multiContext({ a: dragNode({ gridColumnSpan: 2, gridRowSpan: 2, id: 'a' }), b: dragNode({ id: 'b' }) }),
      4,
    );

    expect(result.previewCells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 1 },
      { column: 1, row: 1 },
      { column: 2, row: 0 },
    ]);
  });

  it('should drop duplicate cells where two dragged footprints overlap', () => {
    const result = withGridSpanPreview(
      hover([
        { column: 0, row: 0 },
        { column: 1, row: 0 },
      ]),
      multiContext({
        a: dragNode({ gridColumnSpan: 2, id: 'a' }),
        b: dragNode({ gridColumnSpan: 2, id: 'b' }),
      }),
      4,
    );

    // a -> {0,0},{1,0}; b -> {1,0},{2,0}; the shared {1,0} appears once
    expect(result.previewCells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 2, row: 0 },
    ]);
  });

  it('should expand a spanning dragged node into its full footprint from the anchor', () => {
    const result = withGridSpanPreview(hover([{ column: 1, row: 0 }]), context(dragNode({ gridColumnSpan: 2, gridRowSpan: 2 })), 4);

    expect(result.previewCells).toEqual([
      { column: 1, row: 0 },
      { column: 2, row: 0 },
      { column: 1, row: 1 },
      { column: 2, row: 1 },
    ]);
  });

  it('should slide the footprint left so it fits the column count, since columns cannot grow', () => {
    const result = withGridSpanPreview(hover([{ column: 3, row: 0 }]), context(dragNode({ gridColumnSpan: 3 })), 4);

    // anchored at column 3 with span 3 in a 4-column grid -> slid to start at column 1
    expect(result.previewCells).toEqual([
      { column: 1, row: 0 },
      { column: 2, row: 0 },
      { column: 3, row: 0 },
    ]);
  });

  it('should let the footprint run off the bottom — the draw pass clips it and the grid grows on drop', () => {
    const result = withGridSpanPreview(hover([{ column: 0, row: 2 }]), context(dragNode({ gridRowSpan: 3 })), 4);

    expect(result.previewCells).toEqual([
      { column: 0, row: 2 },
      { column: 0, row: 3 },
      { column: 0, row: 4 },
    ]);
  });

  it('should treat a dragged node with no grid placement input as a plain 1x1', () => {
    // "b" opts out of the grid (ignoreAutoLayout) so it has no placement input
    const result = withGridSpanPreview(
      hover([
        { column: 0, row: 0 },
        { column: 2, row: 0 },
      ]),
      multiContext({
        a: dragNode({ gridColumnSpan: 2, id: 'a' }),
        b: dragNode({ id: 'b', ignoreAutoLayout: true } as Partial<TSceneNode>),
      }),
      4,
    );

    expect(result.previewCells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 2, row: 0 },
    ]);
  });

  it('should drop footprint cells that another element already holds', () => {
    // "blocker" auto-flows to (0,0); dragging the 2x2 "drag" anchored at (0,0) can't cover it
    const result = withGridSpanPreview(
      hover([{ column: 0, row: 0 }]),
      {
        count: 1,
        frame: frame({ childIds: ['blocker', 'drag'] }),
        movedNodeIds: ['drag'],
        nodesById: {
          blocker: dragNode({ id: 'blocker' }),
          drag: dragNode({ gridColumnSpan: 2, gridRowSpan: 2 }),
        },
      },
      4,
    );

    expect(result.previewCells).toEqual([
      { column: 1, row: 0 },
      { column: 0, row: 1 },
      { column: 1, row: 1 },
    ]);
  });
});
