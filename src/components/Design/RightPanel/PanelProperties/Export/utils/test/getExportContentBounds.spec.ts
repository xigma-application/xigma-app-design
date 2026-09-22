// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getExportContentBounds } from '../getExportContentBounds';

const solidFill = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 100,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: solidFill,
  height: 10,
  id: 'rect',
  name: 'rect',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getExportContentBounds', () => {
  it('should fall back to an empty rect when the node does not exist', () => {
    expect(getExportContentBounds('missing', {})).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should fall back to the node own bounds when it has no visible content of its own', () => {
    const node = frame({ height: 100, width: 100, x: 10, y: 10 });

    expect(getExportContentBounds('frame', { frame: node })).toEqual({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should tightly union visible leaf content instead of using an empty frame own declared bounds', () => {
    const child = rect({ height: 30, id: 'child', parentId: 'frame', width: 30, x: 20, y: 20 });
    const root = frame({ childIds: ['child'], height: 200, width: 200, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { child, frame: root };

    expect(getExportContentBounds('frame', nodesById)).toEqual({ height: 30, width: 30, x: 20, y: 20 });
  });

  it('should include an own-filled frame own bounds alongside its children', () => {
    const child = rect({ height: 30, id: 'child', parentId: 'frame', width: 30, x: 20, y: 20 });
    const root = frame({ childIds: ['child'], fills: solidFill, height: 200, width: 200, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { child, frame: root };

    expect(getExportContentBounds('frame', nodesById)).toEqual({ height: 200, width: 200, x: 0, y: 0 });
  });

  it('should count a legacy strokeColor/strokeWidth pair (no fills/strokes array) as visible paint too', () => {
    const root = frame({ height: 50, strokeColor: '#000000', strokeWidth: 2, width: 50, x: 0, y: 0 });

    expect(getExportContentBounds('frame', { frame: root })).toEqual({ height: 50, width: 50, x: 0, y: 0 });
  });

  it('should clip a child against a clipContent ancestor and union it with an unclipped sibling (locked worked example)', () => {
    // F: 0,0 200x200, clipContent, no fill -> doesn't contribute its own box
    // A: 20,20 30x30, fully inside F -> contributes unchanged
    // B: 150,150 100x100 (spans to 250,250) -> clipped by F to 150,150 50x50
    // union of A (20,20,30,30) and clipped-B (150,150,50,50) = {x:20, y:20, width:180, height:180}
    const nodeA = rect({ height: 30, id: 'a', parentId: 'frame', width: 30, x: 20, y: 20 });
    const nodeB = rect({ height: 100, id: 'b', parentId: 'frame', width: 100, x: 150, y: 150 });
    const root = frame({ childIds: ['a', 'b'], clipContent: true, height: 200, width: 200, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { a: nodeA, b: nodeB, frame: root };

    expect(getExportContentBounds('frame', nodesById)).toEqual({ height: 180, width: 180, x: 20, y: 20 });
  });

  it('should drop a child entirely clipped away by a clipContent ancestor', () => {
    const child = rect({ height: 20, id: 'child', parentId: 'frame', width: 20, x: 300, y: 300 });
    const root = frame({ childIds: ['child'], clipContent: true, height: 100, width: 100, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { child, frame: root };

    // nothing visible survives -> falls back to the (unfilled) root's own declared bounds
    expect(getExportContentBounds('frame', nodesById)).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });

  it('should not clip against a non-clipping frame ancestor', () => {
    const child = rect({ height: 20, id: 'child', parentId: 'frame', width: 20, x: 300, y: 300 });
    const root = frame({ childIds: ['child'], clipContent: false, height: 100, width: 100, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { child, frame: root };

    expect(getExportContentBounds('frame', nodesById)).toEqual({ height: 20, width: 20, x: 300, y: 300 });
  });

  it('should never let a Group or Mask contribute its own box, only its children', () => {
    const child = rect({ height: 10, id: 'child', parentId: 'group', width: 10, x: 5, y: 5 });
    const group: TGroupNode = {
      childIds: ['child'],
      height: 500,
      id: 'group',
      name: 'group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 500,
      x: 0,
      y: 0,
    };
    const nodesById: Record<string, TSceneNode> = { child, group };

    expect(getExportContentBounds('group', nodesById)).toEqual({ height: 10, width: 10, x: 5, y: 5 });
  });

  it('should apply clipping recursively through nested clipping frames', () => {
    const child = rect({ height: 100, id: 'child', parentId: 'inner', width: 100, x: 40, y: 40 });
    const inner = frame({ childIds: ['child'], clipContent: true, height: 60, id: 'inner', parentId: 'outer', width: 60, x: 0, y: 0 });
    const outer = frame({ childIds: ['inner'], clipContent: true, height: 30, id: 'outer', width: 30, x: 0, y: 0 });
    const nodesById: Record<string, TSceneNode> = { child, inner, outer };

    // child (40,40,100,100) clipped by inner (0,0,60,60) -> (40,40,20,20), then clipped by outer (0,0,30,30) -> (40,40 falls entirely outside 0..30) -> empty
    expect(getExportContentBounds('outer', nodesById)).toEqual({ height: 30, width: 30, x: 0, y: 0 });
  });

  it('should stop the ancestor walk without clipping further when a stale parentId points to a node missing from the map', () => {
    // "leaf" has a parentId ('ghost') that isn't itself in nodesById, even though it's still listed as
    // a real child of the actual root — a stale-reference edge case, not a normal well-formed tree
    const leaf = rect({ height: 10, id: 'leaf', parentId: 'ghost', width: 10, x: 5, y: 5 });
    const root = frame({ childIds: ['leaf'], id: 'root' });
    const nodesById: Record<string, TSceneNode> = { leaf, root };

    expect(getExportContentBounds('root', nodesById)).toEqual({ height: 10, width: 10, x: 5, y: 5 });
  });
});
