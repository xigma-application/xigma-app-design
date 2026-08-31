// types
import { NodeType, PathType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TPathNode, TSceneNode } from 'types/design/types';

// utils
import { TSceneNodeHitContext } from '../types';
import { isPointOnSceneNode } from '../isPointOnSceneNode';

const buildContext = (node: TSceneNode, point: TPoint, overrides: Partial<TSceneNodeHitContext> = {}): TSceneNodeHitContext => ({
  lineTolerance: 4,
  node,
  nodesById: { [node.id]: node },
  pathTextTolerance: 4,
  point,
  testPoint: point,
  textPathBoundVectorIds: new Set<string>(),
  zoom: 1,
  ...overrides,
});

const buildFrame = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'a',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('isPointOnSceneNode', () => {
  it('should hit-test an ellipse against its inscribed ellipse, not its bounding box', () => {
    // mock
    const node = buildFrame({ height: 10, type: NodeType.ellipse, width: 20 });

    // result — the (0, 0) corner is inside the box but outside the ellipse
    expect(isPointOnSceneNode(buildContext(node, { x: 0, y: 0 }))).toBe(false);
    expect(isPointOnSceneNode(buildContext(node, { x: 10, y: 5 }))).toBe(true);
  });

  it('should grow an ellipse’s hit area outward by half its stroke width', () => {
    // mock
    const node = buildFrame({ height: 10, strokeColor: '#000000', strokeWidth: 8, type: NodeType.ellipse, width: 10 });

    // result — just past the inscribed ellipse's edge, on the stroke ring
    expect(isPointOnSceneNode(buildContext(node, { x: 8, y: 5 }))).toBe(true);
  });

  it('should hit-test a polygon against its vertices, not its bounding box', () => {
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

    // result
    expect(isPointOnSceneNode(buildContext(node, { x: 0, y: 0 }))).toBe(false);
    expect(isPointOnSceneNode(buildContext(node, { x: 5, y: 5 }))).toBe(true);
  });

  it('should hit-test a star against its points, not its bounding box', () => {
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

    // result
    expect(isPointOnSceneNode(buildContext(node, { x: 73.51, y: 17.64 }))).toBe(false);
    expect(isPointOnSceneNode(buildContext(node, { x: 50, y: 50 }))).toBe(true);
  });

  it('should hit-test a line by distance from its segment, widened to its own stroke width', () => {
    // mock
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

    // result — 6 world units off the segment, past the 4px default but within strokeWidth / 2
    expect(isPointOnSceneNode(buildContext(line, { x: 5, y: 6 }))).toBe(true);
  });

  it('should route text-on-a-path through curved-glyph hit-testing', () => {
    // mock
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

    // result — on the curve at the content vs. on the curve far from the short content
    expect(isPointOnSceneNode(buildContext(node, { x: 200, y: 100 }))).toBe(true);
    expect(isPointOnSceneNode(buildContext(node, { x: 0, y: 100 }))).toBe(false);
  });

  it('should route free-standing text through per-line text hit-testing', () => {
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

    // result
    expect(isPointOnSceneNode(buildContext(node, { x: 2, y: 2 }))).toBe(true);
    expect(isPointOnSceneNode(buildContext(node, { x: 300, y: 300 }))).toBe(false);
  });

  it('should never hit a bare path node', () => {
    // mock
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
    expect(isPointOnSceneNode(buildContext(node, { x: 100, y: 100 }))).toBe(false);
  });

  it('should route a vector node through vector hit-testing, honouring the text-path bound set', () => {
    // mock
    const node: TSceneNode = {
      fillColor: '#ff0000',
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

    // result — a hit on the stroke normally, but inert while listed as a text-path guide
    expect(isPointOnSceneNode(buildContext(node, { x: 50, y: 0 }))).toBe(true);
    expect(isPointOnSceneNode(buildContext(node, { x: 50, y: 0 }, { textPathBoundVectorIds: new Set(['vector-1']) }))).toBe(false);
  });

  it('should hit-test any other node type against its rectangle, grown by half its stroke width', () => {
    // mock
    const node = buildFrame({ strokeColor: '#000000', strokeWidth: 8 });

    // result — 2 world units past the nominal box, on the stroke ring
    expect(isPointOnSceneNode(buildContext(node, { x: 12, y: 5 }))).toBe(true);
    expect(isPointOnSceneNode(buildContext(node, { x: 20, y: 5 }))).toBe(false);
  });
});
