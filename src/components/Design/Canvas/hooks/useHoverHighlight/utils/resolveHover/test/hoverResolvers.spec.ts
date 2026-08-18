// types
import { NodeType, ToolName } from 'types/design/enums';
import { TEllipseNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TTextNode } from 'types/design/types';
import { THoverResolverContext } from '../types';

// utils
import {
  resolveCornerRadiusHover,
  resolveEditingTextHover,
  resolveEllipseArcHover,
  resolveLineEndpointHover,
  resolvePathOffsetHover,
  resolvePlainNodeHover,
  resolvePolygonVertexHover,
  resolveResizeHover,
  resolveRotateHover,
  resolveStarVertexHover,
} from '../hoverResolvers';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createContext = (overrides: Partial<THoverResolverContext>): THoverResolverContext => ({
  activeTool: ToolName.default,
  editingContent: '',
  editingNodeId: null,
  editingTextBox: null,
  orderedNodes: [],
  point: { x: 0, y: 0 },
  resizableSelectedNodes: [],
  resizeHandleHit: null,
  selectedNodes: [],
  viewport: IDENTITY_VIEWPORT,
  ...overrides,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#ffffff',
  type: NodeType.line,
  x1: 500,
  x2: 600,
  y1: 500,
  y2: 500,
};

const pathText: TTextNode = {
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 4000,
  y: 4000,
};

const polygon: TPolygonNode = {
  cornerRadius: 15,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 3,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
};

const star: TStarNode = {
  cornerRadius: 0,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
};

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  cornerRadius: 20,
  fill: '#ff0000',
  height: 100,
  id: 'rectangle-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('resolveLineEndpointHover', () => {
  it('should return a hover result over a selected line endpoint', () => {
    // result
    expect(resolveLineEndpointHover(createContext({ point: { x: 500, y: 500 }, resizableSelectedNodes: [line] }))).toEqual({
      className: 'positioning',
      cursor: '',
      nodeId: 'line-1',
    });
  });

  it('should return undefined when the point misses the line endpoint', () => {
    // result
    expect(resolveLineEndpointHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [line] }))).toBeUndefined();
  });
});

describe('resolvePathOffsetHover', () => {
  it('should return a hover result over a selected path-text start-offset handle', () => {
    // result
    expect(resolvePathOffsetHover(createContext({ point: { x: 4200, y: 4100 }, selectedNodes: [pathText] }))).toEqual({
      className: 'hand',
      cursor: '',
      nodeId: 'text-1',
    });
  });

  it('should return undefined when the point misses the start-offset handle', () => {
    // result
    expect(resolvePathOffsetHover(createContext({ point: { x: 4000, y: 4000 }, selectedNodes: [pathText] }))).toBeUndefined();
  });
});

describe('resolveEditingTextHover', () => {
  const editingTextBox = { flipX: false, flipY: false, height: 20, rotation: 0, width: 200, x: 5000, y: 5000 };

  it('should return a hover result over text currently being edited', () => {
    // result
    expect(resolveEditingTextHover(createContext({ editingContent: 'Hello', editingTextBox, point: { x: 5005, y: 5010 } }))).toEqual({
      className: null,
      cursor: 'text',
      nodeId: null,
    });
  });

  it('should return undefined when the point misses the editing text', () => {
    // result
    expect(
      resolveEditingTextHover(createContext({ editingContent: 'Hello', editingTextBox, point: { x: 5005, y: 5200 } })),
    ).toBeUndefined();
  });
});

describe('resolvePolygonVertexHover', () => {
  it('should return a hover result over a selected polygon vertex-count handle', () => {
    // mock — vertex index 1 of a 100x100 triangle sits at (93.301270, 75)
    // result
    expect(resolvePolygonVertexHover(createContext({ point: { x: 93.30127, y: 75 }, resizableSelectedNodes: [polygon] }))).toEqual({
      className: 'vertices',
      cursor: '',
      nodeId: 'polygon-1',
    });
  });

  it('should return undefined when the point misses the polygon vertex-count handle', () => {
    // result
    expect(resolvePolygonVertexHover(createContext({ point: { x: 90, y: 90 }, resizableSelectedNodes: [polygon] }))).toBeUndefined();
  });
});

describe('resolveStarVertexHover', () => {
  it('should return a hover result over a selected star vertex-count handle', () => {
    // mock — vertex index 2 of a 100x100 5-point star sits at (97.552826, 34.549150)
    // result
    expect(resolveStarVertexHover(createContext({ point: { x: 97.552826, y: 34.54915 }, resizableSelectedNodes: [star] }))).toEqual({
      className: 'vertices',
      cursor: '',
      nodeId: 'star-1',
    });
  });

  it('should return undefined when the point misses the star vertex-count handle', () => {
    // result
    expect(resolveStarVertexHover(createContext({ point: { x: 90, y: 90 }, resizableSelectedNodes: [star] }))).toBeUndefined();
  });
});

describe('resolveEllipseArcHover', () => {
  it('should return a hover result over the Sweep handle', () => {
    // mock — default arcEndAngle (90deg) puts the Sweep handle at the east rim (100, 50)
    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 100, y: 50 }, resizableSelectedNodes: [ellipse] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'ellipse-1',
    });
  });

  it('should return a hover result over the Start (rotate) handle', () => {
    // mock — cut from arcStartAngle 90 to arcEndAngle 0; Start handle stays at the east rim (100, 50)
    const cutEllipse: TEllipseNode = { ...ellipse, arcEndAngle: 0, arcStartAngle: 90 };

    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 100, y: 50 }, resizableSelectedNodes: [cutEllipse] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'ellipse-1',
    });
  });

  it('should return a hover result over the Ratio handle', () => {
    // mock — the Ratio handle rests at dead center (50, 50) while arcRatio is 0
    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 50, y: 50 }, resizableSelectedNodes: [ellipse] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'ellipse-1',
    });
  });

  it('should return undefined when the point misses every ellipse arc handle', () => {
    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [ellipse] }))).toBeUndefined();
  });
});

describe('resolveResizeHover', () => {
  const resizeHandleHit: THoverResolverContext['resizeHandleHit'] = {
    bounds: { height: 100, width: 100, x: 0, y: 0 },
    handle: 'nw',
    rotation: 0,
  };

  it('should return a hover result with the resize cursor for the default tool', () => {
    // result
    expect(resolveResizeHover(createContext({ activeTool: ToolName.default, resizeHandleHit }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return a hover result with the scale cursor when the Scale tool is active', () => {
    // result
    expect(resolveResizeHover(createContext({ activeTool: ToolName.scale, resizeHandleHit }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return undefined when no resize handle was hit', () => {
    // result
    expect(resolveResizeHover(createContext({ resizeHandleHit: null }))).toBeUndefined();
  });
});

describe('resolveCornerRadiusHover', () => {
  it('should return a hover result over a selected rectangle corner-radius handle', () => {
    // mock — a 100x100 rectangle with cornerRadius 20 has its ne handle at (100, 20)
    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 80, y: 20 }, resizableSelectedNodes: [rectangle] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'rectangle-1',
    });
  });

  it('should return a hover result over a selected polygon corner-radius handle', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); radius 15 moves it toward center
    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 50, y: 30 }, resizableSelectedNodes: [polygon] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'polygon-1',
    });
  });

  it('should return a hover result over a selected star corner-radius handle', () => {
    // mock — top vertex of a 100x100 5-point star; radius 15 moves it toward center
    const cornerRadiusStar: TStarNode = { ...star, cornerRadius: 15 };

    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 50, y: 33.893272 }, resizableSelectedNodes: [cornerRadiusStar] }))).toEqual(
      {
        className: 'radius',
        cursor: '',
        nodeId: 'star-1',
      },
    );
  });

  it('should return undefined when a resize handle was already hit, without checking the polygon/star handles', () => {
    // mock
    const resizeHandleHit: THoverResolverContext['resizeHandleHit'] = {
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'nw',
      rotation: 0,
    };

    // result
    expect(
      resolveCornerRadiusHover(createContext({ point: { x: 50, y: 30 }, resizableSelectedNodes: [polygon], resizeHandleHit })),
    ).toBeUndefined();
  });

  it('should return undefined when the point misses every corner-radius handle', () => {
    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [rectangle] }))).toBeUndefined();
  });
});

describe('resolveRotateHover', () => {
  const rotatingFrame: TRectangleNode = { ...rectangle, cornerRadius: undefined, height: 100, width: 100, x: 3000, y: 3000 };

  it('should return a hover result with the rotate cursor just outside the resize handle', () => {
    // result
    expect(resolveRotateHover(createContext({ point: { x: 3000, y: 2990 }, resizableSelectedNodes: [rotatingFrame] }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return undefined when the point misses the rotate ring', () => {
    // result
    expect(resolveRotateHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [rotatingFrame] }))).toBeUndefined();
  });
});

describe('resolvePlainNodeHover', () => {
  it("should return the hovered node's own id when the point lands on a node", () => {
    // result
    expect(resolvePlainNodeHover(createContext({ orderedNodes: [rectangle], point: { x: 50, y: 50 } }))).toEqual({
      className: null,
      cursor: '',
      nodeId: 'rectangle-1',
    });
  });

  it('should return a null nodeId when the point misses every node', () => {
    // result
    expect(resolvePlainNodeHover(createContext({ orderedNodes: [rectangle], point: { x: 900, y: 900 } }))).toEqual({
      className: null,
      cursor: '',
      nodeId: null,
    });
  });
});
