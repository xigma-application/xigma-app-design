// types
import { NodeType, PathType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { getFrameNameLabelRects } from '../../getFrameNameLabelRects';
import { getNodeAtPoint } from '../getNodeAtPoint';
import { getSectionNameLabelRects } from '../../getSectionNameLabelRects';

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TSectionNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
    height: 10,
    id: 'node',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getNodeAtPoint', () => {
  it('should return the node the point falls inside', () => {
    // mock
    const node = buildNode({ id: 'a' });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should return null when the point misses every node', () => {
    // mock
    const node = buildNode({ id: 'a' });

    // result
    expect(getNodeAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return the topmost (last-drawn) node when nodes overlap', () => {
    // mock
    const bottom = buildNode({ id: 'bottom' });
    const top = buildNode({ id: 'top' });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [bottom, top], IDENTITY_VIEWPORT)?.id).toBe('top');
  });

  it('should treat the edges of a node as inside', () => {
    // mock
    const node = buildNode({ height: 10, id: 'a', width: 10, x: 0, y: 0 });

    // result
    expect(getNodeAtPoint({ x: 10, y: 10 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should return null for an empty scene', () => {
    // result
    expect(getNodeAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should use elliptical hit-testing for ellipse nodes, not the bounding box', () => {
    // mock
    const node = buildNode({ height: 10, type: NodeType.ellipse, width: 20, x: 0, y: 0 });

    // result — the bounding box's (0, 0) corner sits outside the inscribed ellipse
    expect(getNodeAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 10, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should use polygonal hit-testing for polygon nodes, not the bounding box', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 10,
      id: 'a',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 4,
      type: NodeType.polygon,
      width: 10,
      x: 0,
      y: 0,
    };

    // result — the bounding box's (0, 0) corner sits outside the diamond inscribed in it
    expect(getNodeAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should use star-shaped hit-testing for star nodes, not the bounding box', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 100,
      id: 'a',
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.382,
      rotation: 0,
      type: NodeType.star,
      width: 100,
      x: 0,
      y: 0,
    };

    // result — this point sits in a concave notch, beyond the inner radius reached there
    expect(getNodeAtPoint({ x: 73.51, y: 17.64 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should use distance-from-segment hit-testing for line nodes, not the bounding box', () => {
    // mock
    const line: TSceneNode = {
      id: 'a',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // result — (0, 10) sits inside the diagonal's bounding box but far from the diagonal itself
    expect(getNodeAtPoint({ x: 0, y: 10 }, [line], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 5, y: 5 }, [line], IDENTITY_VIEWPORT)).toEqual(line);
  });

  it('should use per-line text hit-testing for text nodes, not the full fixed box', () => {
    // mock
    const node: TSceneNode = {
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 500,
      id: 'a',
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 500,
      x: 0,
      y: 0,
    };

    // result — the box is 500x500 but "Hi" only occupies a small area near the top-left
    expect(getNodeAtPoint({ x: 300, y: 300 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 2, y: 2 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
  });

  it('should hit-test against the rotated shape, not the unrotated bounding box', () => {
    // mock
    const node = buildNode({ height: 10, rotation: 90, width: 20, x: 0, y: 0 });

    // result — (10, -3) sits inside the box once rotated 90deg around its center (10, 5), even
    expect(getNodeAtPoint({ x: 10, y: -3 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
    expect(getNodeAtPoint({ x: 19, y: 9 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should use curved glyph hit-testing for text on a path, not the fixed box or the full curve', () => {
    // mock — a 200x200 circle centered at (100, 100); "Hi" starts at its rightmost point
    const node: TSceneNode = {
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 200,
      id: 'a',
      name: 'Text',
      parentId: null,
      pathId: 'path-1',
      rotation: 0,
      type: NodeType.text,
      width: 200,
      x: 0,
      y: 0,
    };

    // result — on the curve, at the content: hit; on the curve, far from the short content: miss
    expect(getNodeAtPoint({ x: 200, y: 100 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
    expect(getNodeAtPoint({ x: 0, y: 100 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should never hit a bare path node, even for a point squarely inside its bounding box', () => {
    // mock — path nodes are an invisible implementation detail of text-on-path; only the
    // paired text's rendered content should ever be clickable/hoverable
    const node: TPathNode = {
      height: 200,
      id: 'a',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 200,
      x: 0,
      y: 0,
    };

    // result
    expect(getNodeAtPoint({ x: 100, y: 100 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should fall through a bare path node to the node underneath it', () => {
    // mock
    const path: TPathNode = {
      height: 200,
      id: 'a',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 200,
      x: 0,
      y: 0,
    };
    const frame = buildNode({ height: 200, id: 'b', width: 200, x: 0, y: 0 });

    // result — path is drawn on top in z-order but must be transparent to hit-testing
    expect(getNodeAtPoint({ x: 100, y: 100 }, [frame, path], IDENTITY_VIEWPORT)?.id).toBe('b');
  });

  it('should hit-test a vector node against its rotated (baked) geometry, not its raw unrotated segments', () => {
    // mock — a 20x10 rect rotated 90deg around its own center (10, 5); once baked, its edges span
    // x:5..15 / y:-5..15, so a click at (15, 5) lands on the (now-vertical) rotated east edge
    const node: TSceneNode = {
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 90,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 20, y: 0 },
        v3: { id: 'v3', x: 20, y: 10 },
        v4: { id: 'v4', x: 0, y: 10 },
      },
    };

    // result — (15, 5) sits on the rotated shape's edge; (0, 0), the raw v1 vertex, sits well
    // outside the rotated bounds, so a hit there would prove rotation was never actually applied
    expect(getNodeAtPoint({ x: 15, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
    expect(getNodeAtPoint({ x: 0, y: 0 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should never hit a vector node currently bound as a text-on-path guide, even for a point squarely on its stroke', () => {
    // mock — a horizontal a(0,0)->b(100,0) vector, with a text node bound to it as its path
    const vector: TSceneNode = {
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const pathText: TSceneNode = {
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 0,
      id: 'text-1',
      name: 'Text',
      parentId: null,
      pathId: 'vector-1',
      rotation: 0,
      type: NodeType.text,
      width: 100,
      x: 0,
      y: -50,
    };

    // result — the point sits squarely on the vector's own stroke, but the vector is inert as a
    // hit-test target while a text node rides it as a path (the text's own curved hit-test — a
    // miss here, far from "Hi" — is what governs instead)
    expect(getNodeAtPoint({ x: 50, y: 0 }, [vector, pathText], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should still hit an eligible vector node normally when no text node is bound to it', () => {
    // mock — same vector as above, no bound text this time
    const vector: TSceneNode = {
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };

    // result
    expect(getNodeAtPoint({ x: 50, y: 0 }, [vector], IDENTITY_VIEWPORT)).toEqual(vector);
  });

  it('should hit a frame through its floating name label, well outside the frame’s own body', () => {
    // mock — the label floats above the frame's top edge, never overlapping the frame's own
    // y:100..150 range
    const frame = buildNode({ height: 50, id: 'frame-a', name: 'Frame 1', width: 80, x: 0, y: 100 });
    const [labelRect] = getFrameNameLabelRects([frame], IDENTITY_VIEWPORT.zoom);

    // result
    expect(labelRect.center.y).toBeLessThan(100);
    expect(getNodeAtPoint(labelRect.center, [frame], IDENTITY_VIEWPORT)).toEqual(frame);
  });

  it('should not hit a locked frame through its label either', () => {
    // mock
    const frame = buildNode({ height: 50, id: 'frame-a', locked: true, name: 'Frame 1', width: 80, x: 0, y: 100 });
    const [labelRect] = getFrameNameLabelRects([frame], IDENTITY_VIEWPORT.zoom);

    // result
    expect(getNodeAtPoint(labelRect.center, [frame], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should hit a section through its floating name label the same way', () => {
    // mock
    const section: TSectionNode = {
      childIds: [],
      fill: '#444444',
      height: 50,
      id: 'section-a',
      name: 'Section 1',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 80,
      x: 0,
      y: 100,
    };
    const [labelRect] = getSectionNameLabelRects([section], IDENTITY_VIEWPORT.zoom);
    const labelCenter = { x: labelRect.x + labelRect.width / 2, y: labelRect.y + labelRect.height / 2 };

    // result
    expect(labelRect.y + labelRect.height).toBeLessThan(100);
    expect(getNodeAtPoint(labelCenter, [section], IDENTITY_VIEWPORT)).toEqual(section);
  });

  it('should never hit a hidden node', () => {
    // mock
    const node = buildNode({ hidden: true, id: 'a' });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should never hit a locked node', () => {
    // mock
    const node = buildNode({ id: 'a', locked: true });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should fall through a hidden node to the node underneath it', () => {
    // mock
    const hidden = buildNode({ hidden: true, id: 'top' });
    const bottom = buildNode({ id: 'bottom' });

    // result
    expect(getNodeAtPoint({ x: 5, y: 5 }, [bottom, hidden], IDENTITY_VIEWPORT)?.id).toBe('bottom');
  });

  it('should widen the line hit-test tolerance in world units as the viewport zooms out', () => {
    // mock
    const line: TSceneNode = { id: 'a', name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 };

    // result — 6 world units off the segment misses at zoom 1 (4px tolerance) but hits at zoom
    expect(getNodeAtPoint({ x: 5, y: 6 }, [line], IDENTITY_VIEWPORT)).toBeNull();
    expect(getNodeAtPoint({ x: 5, y: 6 }, [line], { x: 0, y: 0, zoom: 0.5 })).toEqual(line);
  });

  it('should widen a line’s hit-test tolerance to match its own strokeWidth when that exceeds the default', () => {
    // mock — 6 world units off the segment, well past the 4px default line tolerance
    const line: TSceneNode = {
      id: 'a',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      strokeWidth: 16,
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 0,
    };

    // result
    expect(getNodeAtPoint({ x: 5, y: 6 }, [line], IDENTITY_VIEWPORT)).toEqual(line);
  });

  it('should extend a rectangle’s clickable area outward by half its stroke width', () => {
    // mock — a point just outside the nominal 10x10 box, on the visible stroke ring
    const node = buildNode({ height: 10, id: 'a', strokeColor: '#000000', strokeWidth: 8, width: 10, x: 0, y: 0 });

    // result
    expect(getNodeAtPoint({ x: 12, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
    expect(getNodeAtPoint({ x: 20, y: 5 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should not extend a rectangle’s clickable area when it has no stroke', () => {
    // mock
    const node = buildNode({ height: 10, id: 'a', width: 10, x: 0, y: 0 });

    // result
    expect(getNodeAtPoint({ x: 12, y: 5 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should extend an ellipse’s clickable area outward by half its stroke width', () => {
    // mock — a point just past the inscribed ellipse's rightmost edge (radiusX 5), on the stroke
    const node = buildNode({
      height: 10,
      id: 'a',
      strokeColor: '#000000',
      strokeWidth: 8,
      type: NodeType.ellipse,
      width: 10,
      x: 0,
      y: 0,
    });

    // result
    expect(getNodeAtPoint({ x: 8, y: 5 }, [node], IDENTITY_VIEWPORT)).toEqual(node);
    expect(getNodeAtPoint({ x: 20, y: 5 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });
});
