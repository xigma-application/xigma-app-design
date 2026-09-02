// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { applyVectorPointSnapping } from '../applyVectorPointSnapping';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('applyVectorPointSnapping', () => {
  it('should return the raw point, unsnapped, with no guide when nothing else is on the scene', () => {
    // action
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, { x: 100, y: 100 }, 1, false, {});

    // result
    expect(result).toEqual({ guide: null, isAngleSnapped: false, point: { x: 100, y: 100 } });
  });

  it('should fall back to the plain angle-snapped point when no alignment guide matches', () => {
    // mock — within cardinal angle-snap tolerance of horizontal from (0,0)
    // action
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, { x: 150, y: 3 }, 1, false, {});

    // result
    expect(result.isAngleSnapped).toBe(true);
    expect(result.point.y).toBe(0);
    expect(result.guide).toBeNull();
  });

  it('should let a matched vertical alignment guide override the angle-snapped x, keeping the angle-snapped y', () => {
    // mock — another vector node's vertex shares x=150 with the raw point, well within alignment
    // tolerance; the raw point (150,3) is also within angle-snap tolerance of horizontal from (0,0)
    const nodes: Record<string, TSceneNode> = {
      other: buildVectorNode({ id: 'other', vertices: { a: { id: 'a', x: 150, y: 900 } } }),
    };

    // action
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, { x: 150, y: 3 }, 1, false, nodes);

    // result
    expect(result.point).toEqual({ x: 150, y: 0 });
    expect(result.guide).toEqual({ horizontal: null, vertical: { anchor: { x: 150, y: 0 }, match: { x: 150, y: 900 } } });
  });

  it('should let a matched horizontal alignment guide override the angle-snapped y, keeping the angle-snapped x', () => {
    // mock — another vertex shares y=100 with the raw point; raw point (3,100) is within angle-snap
    // tolerance of vertical from (0,0)
    const nodes: Record<string, TSceneNode> = {
      other: buildVectorNode({ id: 'other', vertices: { a: { id: 'a', x: 900, y: 100 } } }),
    };

    // action
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, { x: 3, y: 100 }, 1, false, nodes);

    // result
    expect(result.point).toEqual({ x: 0, y: 100 });
    expect(result.guide).toEqual({ horizontal: { anchor: { x: 0, y: 100 }, match: { x: 900, y: 100 } }, vertical: null });
  });

  it('should resolve both axes to independent alignment guides at once, ignoring the angle snap entirely', () => {
    // mock — a diagonal raw point matches two different vertices, one per axis
    const nodes: Record<string, TSceneNode> = {
      other: buildVectorNode({
        id: 'other',
        vertices: { columnMatch: { id: 'columnMatch', x: 300, y: 900 }, rowMatch: { id: 'rowMatch', x: 900, y: 400 } },
      }),
    };

    // action — well outside cardinal angle-snap tolerance from (0,0)
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, { x: 300, y: 400 }, 1, false, nodes);

    // result
    expect(result.point).toEqual({ x: 300, y: 400 });
    expect(result.guide).toEqual({
      horizontal: { anchor: { x: 300, y: 400 }, match: { x: 900, y: 400 } },
      vertical: { anchor: { x: 300, y: 400 }, match: { x: 300, y: 900 } },
    });
  });

  it('should exclude the given vertex id from alignment-guide candidates', () => {
    // mock — the only candidate is the excluded vertex itself
    const nodes: Record<string, TSceneNode> = {
      self: buildVectorNode({ id: 'self', vertices: { moving: { id: 'moving', x: 150, y: 900 } } }),
    };

    // action
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, { x: 150, y: 3 }, 1, false, nodes, 'moving');

    // result — no guide, since the only candidate was excluded
    expect(result.guide).toBeNull();
  });

  it('should hard-constrain the angle when Shift is held, still allowing an alignment guide to win a given axis', () => {
    // mock — Shift-held 30deg constraint would set both x and y from projection, but a vertical guide
    // still overrides the x component
    const nodes: Record<string, TSceneNode> = {
      other: buildVectorNode({ id: 'other', vertices: { a: { id: 'a', x: 129, y: 900 } } }),
    };
    const radians = (30 * Math.PI) / 180;
    const rawPoint = { x: 129, y: 300 * Math.sin(radians) };

    // action
    const result = applyVectorPointSnapping({ x: 0, y: 0 }, rawPoint, 1, true, nodes);

    // result
    expect(result.isAngleSnapped).toBe(true);
    expect(result.point.x).toBe(129);
    expect(result.guide?.vertical).toEqual({ anchor: result.point, match: { x: 129, y: 900 } });
  });
});
