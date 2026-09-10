// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getDerivedGridRowCount } from '../getDerivedGridRowCount';

const frame = (childIds: string[], overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds,
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
});

const child = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
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
    ...overrides,
  }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getDerivedGridRowCount', () => {
  it('should return one row for an empty grid', () => {
    expect(getDerivedGridRowCount(frame([]), {})).toBe(1);
  });

  it('should auto-flow non-anchored children row by row', () => {
    const nodes = byId([child('a'), child('b'), child('c')]);

    // 3 children over 2 columns => 2 rows
    expect(getDerivedGridRowCount(frame(['a', 'b', 'c']), nodes)).toBe(2);
  });

  it('should count the furthest row a manually-anchored child occupies', () => {
    const nodes = byId([child('a', { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 } as Partial<TSceneNode>)]);

    // one child pinned to row index 1 in a 10-column grid => 2 rows, not ceil(1 / 10) = 1
    expect(getDerivedGridRowCount(frame(['a'], { gridAutoPlacement: false, gridColumnCount: 10 }), nodes)).toBe(2);
  });

  it('should include a row span when deriving the furthest row', () => {
    const nodes = byId([child('a', { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1, gridRowSpan: 2 } as Partial<TSceneNode>)]);

    // pinned at row 1, spanning 2 rows => rows 1 and 2 => 3 rows
    expect(getDerivedGridRowCount(frame(['a'], { gridAutoPlacement: false, gridColumnCount: 10 }), nodes)).toBe(3);
  });

  it('should ignore child ids that no longer resolve to a node', () => {
    const nodes = byId([child('a'), child('b')]);

    expect(getDerivedGridRowCount(frame(['a', 'ghost', 'b']), nodes)).toBe(1);
  });

  it('should treat a line child (no grid fields) as a plain auto-flow item', () => {
    const line: TSceneNode = {
      id: 'l',
      name: 'Line',
      parentId: 'grid-1',
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 0,
    };
    const nodes = byId([child('a'), child('b'), line]);

    // three auto-flow items over 2 columns => 2 rows
    expect(getDerivedGridRowCount(frame(['a', 'b', 'l']), nodes)).toBe(2);
  });

  it('should treat a missing column count as a single column', () => {
    const nodes = byId([child('a'), child('b'), child('c')]);

    expect(getDerivedGridRowCount(frame(['a', 'b', 'c'], { gridColumnCount: undefined }), nodes)).toBe(3);
  });
});
