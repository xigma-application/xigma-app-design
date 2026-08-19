// store
import { addNode, setSelection, setVectorEditingNodeId, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TArmContext } from '../../types';
import { TEllipseNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { armBakeVectorRotationOnPointerDown } from '../armBakeVectorRotationOnPointerDown';
import { armCornerRadiusOnPointerDown } from '../armCornerRadiusOnPointerDown';
import { armEllipseArcOnPointerDown } from '../armEllipseArcOnPointerDown';
import { armEllipseArcRatioOnPointerDown } from '../armEllipseArcRatioOnPointerDown';
import { armEllipseArcRotateOnPointerDown } from '../armEllipseArcRotateOnPointerDown';
import { armGroupBoundsOnPointerDown } from '../armGroupBoundsOnPointerDown';
import { armHitOnPointerDown } from '../armHitOnPointerDown';
import { armLineEndpointOnPointerDown } from '../armLineEndpointOnPointerDown';
import { armMarqueeOnPointerDown } from '../armMarqueeOnPointerDown';
import { armPathOffsetOnPointerDown } from '../armPathOffsetOnPointerDown';
import { armPolygonCornerRadiusOnPointerDown } from '../armPolygonCornerRadiusOnPointerDown';
import { armPolygonVertexCountOnPointerDown } from '../armPolygonVertexCountOnPointerDown';
import { armResizeOnPointerDown } from '../armResizeOnPointerDown';
import { armRotateOnPointerDown } from '../armRotateOnPointerDown';
import { armSelectedTextBoundsOnPointerDown } from '../armSelectedTextBoundsOnPointerDown';
import { armStarCornerRadiusOnPointerDown } from '../armStarCornerRadiusOnPointerDown';
import { armStarRatioOnPointerDown } from '../armStarRatioOnPointerDown';
import { armStarVertexCountOnPointerDown } from '../armStarVertexCountOnPointerDown';
import { armVectorEditMissOnPointerDown } from '../armVectorEditMissOnPointerDown';
import { armVectorEdgeInsertOnPointerDown } from '../armVectorEdgeInsertOnPointerDown';
import { armVectorHandleOnPointerDown } from '../armVectorHandleOnPointerDown';
import { armVectorVertexOnPointerDown } from '../armVectorVertexOnPointerDown';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { toggleSelectionOnPointerDown } from '../toggleSelectionOnPointerDown';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, pointerId: 1, ...options });

const addRectangleNode = (x: number, y: number, size = 100): TRectangleNode => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
  );

  const { nodes, rootOrder } = store.getState().design;

  return nodes[rootOrder[rootOrder.length - 1]] as TRectangleNode;
};

const addTextNode = (x: number, y: number, width = 200, height = 200): TTextNode => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height,
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width,
      x,
      y,
    }),
  );

  const { nodes, rootOrder } = store.getState().design;

  return nodes[rootOrder[rootOrder.length - 1]] as TTextNode;
};

const addVectorNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices'], rotation = 0): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
      name: 'Vector',
      parentId: null,
      rotation,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const createContext = (overrides: Partial<TArmContext> = {}): TArmContext => ({
  canvas: createCanvas(),
  canvasRefs: createCanvasRefs(),
  currentSelection: [],
  dispatch: vi.fn(),
  event: pointerEvent(),
  hit: null,
  orderedNodes: [],
  point: { x: 0, y: 0 },
  selectedNodes: [],
  selectionRefs: createSelectionToolRefs(),
  setClassName: vi.fn(),
  viewport: IDENTITY_VIEWPORT,
  ...overrides,
});

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
  x: 0,
  y: 0,
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
  cornerRadius: 15,
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

describe('armPathOffsetOnPointerDown', () => {
  it('should arm the path-offset drag and return true when the start-offset handle is hit', () => {
    // before
    const ctx = createContext({ point: { x: 200, y: 100 }, selectedNodes: [pathText] });

    // result
    expect(armPathOffsetOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.pathOffsetDragRef.current).toEqual({ nodeId: 'text-1' });
    expect(ctx.setClassName).toHaveBeenCalledWith('pressing');
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when the point misses the start-offset handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [pathText] });

    // result
    expect(armPathOffsetOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.pathOffsetDragRef.current).toBeNull();
  });
});

describe('armPolygonVertexCountOnPointerDown', () => {
  it('should arm the polygon vertex-count drag and return true when its handle is hit', () => {
    // mock — vertex index 1 of a 100x100 triangle sits at (93.301270, 75); cornerRadius 15 pulls it
    // toward center by 15 * (setback 2 - 1) to (80.310889, 67.5)
    // before
    const ctx = createContext({ point: { x: 80.310889, y: 67.5 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonVertexCountOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.polygonVertexCountDragRef.current).toMatchObject({ nodeId: 'polygon-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 90, y: 90 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonVertexCountOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.polygonVertexCountDragRef.current).toBeNull();
  });
});

describe('armStarVertexCountOnPointerDown', () => {
  it('should arm the star vertex-count drag and return true when its handle is hit', () => {
    // mock — vertex index 2 sits at (97.552826, 34.549150); cornerRadius 15 exceeds this star's own
    // max (~13.011), so it clamps there before pulling the handle toward center, to (81.966972, 39.613301)
    // before
    const ctx = createContext({ point: { x: 81.966972, y: 39.613301 }, selectedNodes: [star] });

    // result
    expect(armStarVertexCountOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.starVertexCountDragRef.current).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 90, y: 90 }, selectedNodes: [star] });

    // result
    expect(armStarVertexCountOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.starVertexCountDragRef.current).toBeNull();
  });
});

describe('armStarRatioOnPointerDown', () => {
  it('should arm the star ratio drag and return true when its handle is hit', () => {
    // mock — vertex index 1 sits at (64.694631, 29.774575); this star's own max corner radius is
    // ~13.011, well under the raw cornerRadius of 15, so it clamps there before pulling the handle
    // toward center, to (65.687108, 28.408548)
    // before
    const ctx = createContext({ point: { x: 65.687108, y: 28.408548 }, selectedNodes: [star] });

    // result
    expect(armStarRatioOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.starRatioDragRef.current).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 90, y: 90 }, selectedNodes: [star] });

    // result
    expect(armStarRatioOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.starRatioDragRef.current).toBeNull();
  });
});

describe('armEllipseArcOnPointerDown', () => {
  it('should arm the ellipse arc (Sweep) drag and return true when its handle is hit', () => {
    // mock — default arcEndAngle (90deg) puts the Sweep handle at the east rim (100, 50)
    // before
    const ctx = createContext({ point: { x: 100, y: 50 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.ellipseArcDragRef.current).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.ellipseArcDragRef.current).toBeNull();
  });
});

describe('armEllipseArcRotateOnPointerDown', () => {
  it('should arm the ellipse arc Start (rotate) drag and return true when its handle is hit', () => {
    // mock — cut from arcStartAngle 90 to arcEndAngle 0; Start handle stays at the east rim (100, 50)
    const cutEllipse: TEllipseNode = { ...ellipse, arcEndAngle: 0, arcStartAngle: 90 };

    // before
    const ctx = createContext({ point: { x: 100, y: 50 }, selectedNodes: [cutEllipse] });

    // result
    expect(armEllipseArcRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.ellipseArcRotateDragRef.current).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.ellipseArcRotateDragRef.current).toBeNull();
  });
});

describe('armEllipseArcRatioOnPointerDown', () => {
  it('should arm the ellipse arc Ratio drag and return true when its handle is hit', () => {
    // mock — the Ratio handle rests at dead center (50, 50) while arcRatio is 0
    // before
    const ctx = createContext({ point: { x: 50, y: 50 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcRatioOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.ellipseArcRatioDragRef.current).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcRatioOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.ellipseArcRatioDragRef.current).toBeNull();
  });
});

describe('armResizeOnPointerDown', () => {
  it('should arm the resize drag and return true when a resize handle is hit', () => {
    // mock — the "nw" corner handle of a 100x100 node at (0,0) sits at (0, 0)
    // before
    const ctx = createContext({ point: { x: 0, y: 0 }, selectedNodes: [rectangle] });

    // result
    expect(armResizeOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.resizeDragRef.current).toMatchObject({ handle: 'nw' });
  });

  it('should return undefined when the point misses every resize handle', () => {
    // before
    const ctx = createContext({ point: { x: 50, y: 50 }, selectedNodes: [rectangle] });

    // result
    expect(armResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.resizeDragRef.current).toBeNull();
  });
});

describe('armCornerRadiusOnPointerDown', () => {
  it('should arm the corner-radius drag and return true when a rectangle handle is hit', () => {
    // mock — a 100x100 rectangle with cornerRadius 20 has its ne handle near (80, 20)
    // before
    const ctx = createContext({ point: { x: 80, y: 20 }, selectedNodes: [rectangle] });

    // result
    expect(armCornerRadiusOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.cornerRadiusDragRef.current).toMatchObject({ nodeId: 'rectangle-1' });
  });

  it('should return undefined when the point misses every corner-radius handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [rectangle] });

    // result
    expect(armCornerRadiusOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.cornerRadiusDragRef.current).toBeNull();
  });
});

describe('armPolygonCornerRadiusOnPointerDown', () => {
  it('should arm the polygon corner-radius drag and return true when its handle is hit', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); radius 15 moves it toward center
    // before
    const ctx = createContext({ point: { x: 50, y: 30 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonCornerRadiusOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.polygonCornerRadiusDragRef.current).toMatchObject({ nodeId: 'polygon-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonCornerRadiusOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.polygonCornerRadiusDragRef.current).toBeNull();
  });
});

describe('armStarCornerRadiusOnPointerDown', () => {
  it('should arm the star corner-radius drag and return true when its handle is hit', () => {
    // mock — top vertex of a 100x100 5-point star; radius 15 moves it toward center
    // before
    const ctx = createContext({ point: { x: 50, y: 33.893272 }, selectedNodes: [star] });

    // result
    expect(armStarCornerRadiusOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.starCornerRadiusDragRef.current).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [star] });

    // result
    expect(armStarCornerRadiusOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.starCornerRadiusDragRef.current).toBeNull();
  });
});

describe('armRotateOnPointerDown', () => {
  const rotatingRectangle: TRectangleNode = { ...rectangle, cornerRadius: undefined, x: 3000, y: 3000 };

  it('should arm the rotate drag and return true when the point lands in the rotate ring', () => {
    // before — just outside the resize handle radius above the "nw" corner
    const ctx = createContext({ point: { x: 3000, y: 2990 }, selectedNodes: [rotatingRectangle] });

    // result
    expect(armRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.rotateDragRef.current).not.toBeNull();
  });

  it('should return undefined when the point misses the rotate ring', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [rotatingRectangle] });

    // result
    expect(armRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.rotateDragRef.current).toBeNull();
  });
});

describe('armLineEndpointOnPointerDown', () => {
  it('should arm the line endpoint drag and return true when an endpoint is hit without shift', () => {
    // before
    const ctx = createContext({ point: { x: 500, y: 500 }, selectedNodes: [line] });

    // result
    expect(armLineEndpointOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.endpointDragRef.current).toMatchObject({ nodeId: 'line-1' });
  });

  it('should return undefined when shift is held even though an endpoint is hit', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ shiftKey: true }), point: { x: 500, y: 500 }, selectedNodes: [line] });

    // result
    expect(armLineEndpointOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.endpointDragRef.current).toBeNull();
  });

  it('should return undefined when the point misses every endpoint', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [line] });

    // result
    expect(armLineEndpointOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.endpointDragRef.current).toBeNull();
  });
});

describe('toggleSelectionOnPointerDown', () => {
  it('should dispatch a toggled selection and return true when a node is hit with shift held', () => {
    // before
    const ctx = createContext({ currentSelection: ['other-id'], event: pointerEvent({ shiftKey: true }), hit: rectangle });

    // result
    expect(toggleSelectionOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).toHaveBeenCalledWith(setSelection(['other-id', 'rectangle-1']));
  });

  it('should return undefined when shift is not held', () => {
    // before
    const ctx = createContext({ hit: rectangle });

    // result
    expect(toggleSelectionOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when nothing was hit', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ shiftKey: true }), hit: null });

    // result
    expect(toggleSelectionOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });
});

describe('armHitOnPointerDown', () => {
  it('should arm the hit drag and return true when a node was hit', () => {
    // mock — armDrag reads node origins from the real store, so the hit node must exist there
    const storedRectangle = addRectangleNode(0, 0);

    // before
    const ctx = createContext({ hit: storedRectangle, selectedNodes: [storedRectangle] });

    // result
    expect(armHitOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.dragStateRef.current).not.toBeNull();
    expect(ctx.dispatch).toHaveBeenCalledWith(setSelection([storedRectangle.id]));
  });

  it('should return undefined when nothing was hit', () => {
    // before
    const ctx = createContext({ hit: null });

    // result
    expect(armHitOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.dragStateRef.current).toBeNull();
  });
});

describe('armSelectedTextBoundsOnPointerDown', () => {
  it('should arm the hit drag and return true when the point lands inside a selected text box', () => {
    // mock — armDrag reads node origins from the real store, so the selected node must exist there
    const storedText = addTextNode(0, 0);

    // before
    const ctx = createContext({ point: { x: 50, y: 50 }, selectedNodes: [storedText] });

    // result
    expect(armSelectedTextBoundsOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.dragStateRef.current).not.toBeNull();
  });

  it('should return undefined when shift is held', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ shiftKey: true }), point: { x: 50, y: 50 }, selectedNodes: [pathText] });

    // result
    expect(armSelectedTextBoundsOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.dragStateRef.current).toBeNull();
  });

  it('should return undefined when the point misses the text box', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [pathText] });

    // result
    expect(armSelectedTextBoundsOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.dragStateRef.current).toBeNull();
  });
});

describe('armGroupBoundsOnPointerDown', () => {
  it('should arm the group-bounds drag and return true when the point lands inside the group bounds gap', () => {
    // mock — armDrag reads node origins from the real store, so both nodes must exist there
    const nodeA = addRectangleNode(0, 0, 50);
    const nodeB = addRectangleNode(200, 200);

    // before — between the two nodes, inside their combined bounding box but on neither node
    const ctx = createContext({ currentSelection: [nodeA.id, nodeB.id], point: { x: 150, y: 150 }, selectedNodes: [nodeA, nodeB] });

    // result
    expect(armGroupBoundsOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.dragStateRef.current).not.toBeNull();
  });

  it('should return undefined when shift is held', () => {
    // mock — these two never reach armDrag, so plain fixtures (not in the store) are fine
    const nodeA: TRectangleNode = { ...rectangle, cornerRadius: undefined, id: 'a', width: 50 };
    const nodeB: TRectangleNode = { ...rectangle, cornerRadius: undefined, id: 'b', x: 200, y: 200 };

    // before
    const ctx = createContext({
      currentSelection: ['a', 'b'],
      event: pointerEvent({ shiftKey: true }),
      point: { x: 150, y: 150 },
      selectedNodes: [nodeA, nodeB],
    });

    // result
    expect(armGroupBoundsOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when the point misses the group bounds', () => {
    // mock
    const nodeA: TRectangleNode = { ...rectangle, cornerRadius: undefined, id: 'a', width: 50 };
    const nodeB: TRectangleNode = { ...rectangle, cornerRadius: undefined, id: 'b', x: 200, y: 200 };

    // before
    const ctx = createContext({ currentSelection: ['a', 'b'], point: { x: 900, y: 900 }, selectedNodes: [nodeA, nodeB] });

    // result
    expect(armGroupBoundsOnPointerDown(ctx)).toBeUndefined();
  });
});

describe('armMarqueeOnPointerDown', () => {
  it('should arm the marquee drag, clear the selection, and return true without shift', () => {
    // before
    const ctx = createContext({ point: { x: 42, y: 24 } });

    // result
    expect(armMarqueeOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.marqueeStartRef.current).toEqual({ x: 42, y: 24 });
    expect(ctx.dispatch).toHaveBeenCalledWith(setSelection([]));
  });

  it('should return undefined when shift is held', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ shiftKey: true }), point: { x: 42, y: 24 } });

    // result
    expect(armMarqueeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.marqueeStartRef.current).toBeNull();
  });
});

describe('armBakeVectorRotationOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should bake a live rotation into vertices and reset it to 0, without claiming the pointerdown', () => {
    // mock — a 100x100 square rotated 90deg around its own bounds-center (50, 50)
    const nodeId = addVectorNode(
      {},
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 }, v4: { id: 'v4', x: 0, y: 100 } },
      90,
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext();

    // action
    const result = armBakeVectorRotationOnPointerDown(ctx);

    // result — never claims the event, so the real resolver for whatever was actually clicked still runs
    expect(result).toBeUndefined();
    expect(ctx.dispatch).toHaveBeenCalledTimes(1);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;

    expect(action.payload.id).toBe(nodeId);
    expect(action.payload.changes).toMatchObject({ rotation: 0 });
  });

  it('should not dispatch when the currently-edited vector node has no rotation', () => {
    // mock
    const nodeId = addVectorNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext();

    // result
    expect(armBakeVectorRotationOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext();

    // result
    expect(armBakeVectorRotationOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });
});

describe('armVectorEditMissOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should deselect the current vertex and claim the pointerdown when Vector Edit Mode is active and the click hits nothing', () => {
    // mock
    store.dispatch(setVectorEditingNodeId('vector-1'));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['vertex-1'];

    // before
    const ctx = createContext({ canvasRefs, hit: null });

    // result
    expect(armVectorEditMissOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should return undefined (letting the click fall through) when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ hit: null });

    // result
    expect(armVectorEditMissOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined (letting the click fall through) when the click hits a node', () => {
    // mock
    store.dispatch(setVectorEditingNodeId('vector-1'));

    // before
    const ctx = createContext({ hit: rectangle });

    // result
    expect(armVectorEditMissOnPointerDown(ctx)).toBeUndefined();
  });
});

describe('armVectorEdgeInsertOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should insert a new vertex splitting the segment and return true when the point lands on a straight edge', () => {
    // mock — a straight edge from v1(0,0) to v2(100,0)
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext({ point: { x: 50, y: 0 } });

    // action
    const result = armVectorEdgeInsertOnPointerDown(ctx);

    // result
    expect(result).toBe(true);
    expect(ctx.dispatch).toHaveBeenCalledTimes(1);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;
    const { segments, vertices } = action.payload.changes as Pick<TVectorNode, 'segments' | 'vertices'>;
    const newVertexId = segments.s1.endId;

    expect(action.payload.id).toBe(nodeId);
    expect(newVertexId).not.toBe('v2');
    expect(segments.s1).toEqual({ endId: newVertexId, id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null });
    expect(Object.keys(segments)).toHaveLength(2);

    const newSegmentId = Object.keys(segments).find((id) => id !== 's1') as string;

    expect(segments[newSegmentId]).toEqual({ endId: 'v2', id: newSegmentId, startId: newVertexId, tangentEnd: null, tangentStart: null });
    expect(vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
  });

  it('should return undefined and not dispatch when the point misses every edge', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext({ point: { x: 900, y: 900 } });

    // result
    expect(armVectorEdgeInsertOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined and not dispatch when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 50, y: 0 } });

    // result
    expect(armVectorEdgeInsertOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });
});

describe('armVectorHandleOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should arm the vector-handle drag and return true when a tangent handle is hit', () => {
    // mock — the start handle of v1(0,0) sits at (10, 20) via its tangentStart offset
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext({ point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when the point misses every handle', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext({ point: { x: 900, y: 900 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });
});

describe('armVectorVertexOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should arm the vector-vertex drag and return true when a vertex is hit', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext({ point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toEqual({
      nodeId,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 2, y: 0 },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when the point misses every vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeId(nodeId));

    // before
    const ctx = createContext({ point: { x: 900, y: 900 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toBeNull();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toBeNull();
  });
});
