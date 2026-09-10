// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getGridResolvedTrackSizes } from '../getGridResolvedTrackSizes';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 3,
  gridRowCount: 1,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (id: string, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 40,
  id,
  name: id,
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getGridResolvedTrackSizes', () => {
  it('should split the content width evenly across all-fill columns', () => {
    expect(getGridResolvedTrackSizes(frame(), {})).toEqual({ column: [100, 100, 100], row: [100] });
  });

  it('should keep a fixed column at its own value and share the rest between the fill columns', () => {
    const columnSizes: TGridTrackSize[] = [
      { mode: SizingMode.fixed, value: 60 },
      { mode: SizingMode.fill, value: 1 },
      { mode: SizingMode.fill, value: 1 },
    ];

    expect(getGridResolvedTrackSizes(frame({ gridColumnSizes: columnSizes }), {}).column).toEqual([60, 120, 120]);
  });

  it('should size a hug column to its widest single-cell child', () => {
    const columnSizes: TGridTrackSize[] = [
      { mode: SizingMode.hug },
      { mode: SizingMode.fill, value: 1 },
      { mode: SizingMode.fill, value: 1 },
    ];
    const nodes = byId([rect('a', { width: 70 }), rect('b'), rect('c')]);

    expect(getGridResolvedTrackSizes(frame({ childIds: ['a', 'b', 'c'], gridColumnSizes: columnSizes }), nodes).column).toEqual([
      70, 115, 115,
    ]);
  });

  it('should subtract the column gap from the space the fill columns share', () => {
    expect(getGridResolvedTrackSizes(frame({ horizontalGap: 30 }), {}).column).toEqual([80, 80, 80]);
  });

  it('should subtract per-side padding from the available width', () => {
    expect(getGridResolvedTrackSizes(frame({ paddingLeft: 30, paddingRight: 30 }), {}).column).toEqual([80, 80, 80]);
  });

  it('should collapse fill tracks to their content on a hug frame, on both axes', () => {
    const nodes = byId([rect('a', { height: 55, width: 45 })]);
    const result = getGridResolvedTrackSizes(
      frame({ childIds: ['a'], heightSizingMode: SizingMode.hug, widthSizingMode: SizingMode.hug }),
      nodes,
    );

    expect(result).toEqual({ column: [45, 0, 0], row: [55] });
  });
});
