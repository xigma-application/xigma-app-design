// store
import { addNode, setActiveTool, setPenActiveVertexId, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
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
import { armVectorBendSegmentOnPointerDown } from '../armVectorBendSegmentOnPointerDown';
import { armVectorCornerHandleOnPointerDown } from '../armVectorCornerHandleOnPointerDown';
import { armVectorHandleOnPointerDown } from '../armVectorHandleOnPointerDown/armVectorHandleOnPointerDown';
import { armVectorLassoOnPointerDown } from '../armVectorLassoOnPointerDown/armVectorLassoOnPointerDown';
import { armVectorMarqueeOnPointerDown } from '../armVectorMarqueeOnPointerDown';
import { armVectorMultiSelectBoxOnPointerDown } from '../armVectorMultiSelectBoxOnPointerDown';
import { armVectorMultiSelectResizeOnPointerDown } from '../armVectorMultiSelectResizeOnPointerDown';
import { armVectorMultiSelectRotateOnPointerDown } from '../armVectorMultiSelectRotateOnPointerDown';
import { armVectorPaintOnPointerDown } from '../armVectorPaintOnPointerDown';
import { armVectorSegmentOnPointerDown } from '../armVectorSegmentOnPointerDown/armVectorSegmentOnPointerDown';
import { armVectorVertexOnPointerDown } from '../armVectorVertexOnPointerDown/armVectorVertexOnPointerDown';
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
      filledFaceKeys: [],
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
  activeTool: ToolName.default,
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
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should bake a live rotation into vertices and reset it to 0, without claiming the pointerdown', () => {
    // mock — a 100x100 square rotated 90deg around its own bounds-center (50, 50)
    const nodeId = addVectorNode(
      {},
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 }, v4: { id: 'v4', x: 0, y: 100 } },
      90,
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

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

    store.dispatch(setVectorEditingNodeIds([nodeId]));

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

describe('armVectorMarqueeOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should deselect the current vertex/handle selection, snapshot the pre-drag vertex selection, arm a marquee, capture the pointer, and claim the pointerdown, when Vector Edit Mode is active and the click hits nothing', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['vertex-1'];
    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.selectedVectorSegmentIdsRef.current = ['segment-1'];

    // before
    const ctx = createContext({ canvasRefs, hit: null, point: { x: 42, y: 24 } });

    // result
    expect(armVectorMarqueeOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    // the pre-drag vertex/segment selection is snapshotted, not just dropped — continueVectorMarqueeDrag.ts
    // uses it to keep their tangents visible/catchable for the rest of the gesture even once deselected
    expect(canvasRefs.preVectorMarqueeVertexIdsRef.current).toEqual(['vertex-1']);
    expect(canvasRefs.preVectorMarqueeSegmentIdsRef.current).toEqual(['segment-1']);
    expect(ctx.selectionRefs.vectorMarqueeStartRef.current).toEqual({ x: 42, y: 24 });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined (letting the click fall through) when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ hit: null });

    // result
    expect(armVectorMarqueeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorMarqueeStartRef.current).toBeNull();
  });

  it('should return undefined (letting the click fall through) when the click hits a node', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    // before
    const ctx = createContext({ hit: rectangle });

    // result
    expect(armVectorMarqueeOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined (letting the click fall through) when shift is held', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    // before
    const ctx = createContext({ event: pointerEvent({ shiftKey: true }), hit: null });

    // result
    expect(armVectorMarqueeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorMarqueeStartRef.current).toBeNull();
  });
});

describe('armVectorLassoOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the current vertex/handle/segment selection, start the lasso path at the click point, set the lasso cursor, capture the pointer, and claim the pointerdown, when Lasso is active and Vector Edit Mode is on', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['vertex-1'];
    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.selectedVectorSegmentIdsRef.current = ['segment-1'];

    // before — a click that would otherwise land squarely on a node, to prove Lasso intercepts it anyway
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, hit: rectangle, point: { x: 42, y: 24 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorLassoPathRef.current).toEqual([{ x: 42, y: 24 }]);
    expect(ctx.setClassName).toHaveBeenCalledWith('lasso');
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined (letting the click fall through) when Lasso is not the active tool', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    // before
    const ctx = createContext({ activeTool: ToolName.default });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toBeNull();
  });

  it('should return undefined (letting the click fall through) when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.lasso });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toBeNull();
  });

  it('should return undefined (yield to the vertex-drag resolver) when the click lands exactly on an already-selected vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 0, y: 0 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toBeNull();
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
  });

  it('should still start a fresh lasso path when the click lands on a vertex that is NOT part of the current selection', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before — nothing selected, so v1 is hittable but not "clickable" for a drag
    const ctx = createContext({ activeTool: ToolName.lasso, point: { x: 0, y: 0 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toEqual([{ x: 0, y: 0 }]);
  });

  it('should return undefined (yield) when the click lands exactly on an already-selected tangent handle', () => {
    // mock — the start handle of v1(0,0) sits at (10, 20) via its tangentStart offset; v1 must be
    // selected for the handle to be visible/hittable at all
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];
    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 10, y: 20 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toBeNull();
  });

  it('should still start a fresh lasso path when the click lands on a handle that is NOT itself selected', () => {
    // mock — v1 selected just enough to make its own handle visible/hittable, but the handle itself
    // was never added to the handle selection
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 10, y: 20 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toEqual([{ x: 10, y: 20 }]);
  });

  it('should return undefined (yield) when the click lands on an already-selected segment', () => {
    // mock — v1(0,0)-v2(100,0), click well away from either endpoint
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 25, y: 0 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toBeNull();
  });

  it('should still start a fresh lasso path when the click lands on a segment that is NOT selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, point: { x: 25, y: 0 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toEqual([{ x: 25, y: 0 }]);
  });

  it('should return undefined (yield to the multi-select box) when the click lands inside the bounding box of 2+ selected vertices', () => {
    // mock — v1(0,0), v2(100,100) selected, click at their shared bounding box's center
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toBeNull();
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
  });

  it('should still start a fresh lasso path when the click falls outside the multi-select box of 2+ selected vertices', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 900, y: 900 } });

    // result — clears the pre-existing v1/v2 selection, exactly like starting any other fresh lasso
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(ctx.canvasRefs.vectorLassoPathRef.current).toEqual([{ x: 900, y: 900 }]);
  });
});

describe('armVectorPaintOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should add the clicked face to filledFaceKeys and claim the pointerdown, when the face is not yet filled', () => {
    // mock — a closed triangle, one derivable face
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before — a point inside the triangle
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 50, y: 40 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).toHaveBeenCalledTimes(1);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;

    expect(action.payload.id).toBe(nodeId);
    expect(action.payload.changes).toEqual({ filledFaceKeys: ['s1,s2,s3'] });
  });

  it('should remove the clicked face from filledFaceKeys when it is already filled', () => {
    // mock
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1,s2,s3'] }, id: nodeId }));

    // before
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 50, y: 40 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;

    expect(action.payload.changes).toEqual({ filledFaceKeys: [] });
  });

  it('should claim the pointerdown without dispatching when the click misses every face', () => {
    // mock
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before — a point well outside the triangle
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 500, y: 500 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined (letting the click fall through) when Paint is not the active tool', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.default });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined (letting the click fall through) when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.paint });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });
});

describe('armVectorHandleOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should arm the vector-handle drag, select the handle, deselect any vertex, and return true when a tangent handle is hit', () => {
    // mock — the start handle of v1(0,0) sits at (10, 20) via its tangentStart offset
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should keep the whole multi-selection and arm a group drag with a pending collapse when clicking an already-selected handle', () => {
    // mock — the handle is already selected directly, alongside an unrelated selected vertex
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.selectedVectorVertexIdsRef.current = ['v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 10, y: 20 } });

    // result — the selection is left untouched at pointerdown time; only released-without-moving resolves
    // the collapse (see disarmVectorMultiDrag.spec.ts)
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v2']);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(ctx.canvasRefs.vectorMultiDragRef.current).toMatchObject({
      pendingClickAction: { end: 'start', kind: 'handle', segmentId: 's1' },
      vertexOrigins: { v2: { x: 100, y: 0 } },
    });
  });

  it('should toggle the handle into the multi-selection on shift+click, without arming a drag or touching the vertex selection', () => {
    // mock — v1 stays selected (its own handle must be selected/its parent vertex must be selected to be hittable at all), v2 tags along
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(ctx.canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should toggle an already-selected handle back out of the multi-selection on a second shift+click', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should return undefined when the point misses every handle', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ point: { x: 900, y: 900 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should return undefined when the point sits exactly on a handle whose parent vertex is not selected and which is not itself selected', () => {
    // mock — hidden handle: v1 not selected, the handle itself not selected either
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should hit a handle whose parent vertex is only the Pen tool’s still-active vertex, not part of selectedVectorVertexIdsRef', () => {
    // mock — mirrors leaving the Pen tool mid-draw without ever explicitly selecting v1 via the Selection tool:
    // penActiveVertexId keeps v1's handle visible/hittable exactly like a real vertex selection would
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v1'));

    // before
    const ctx = createContext({ point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });
});

describe('armVectorCornerHandleOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm the vector-handle drag from a corner vertex, mark it symmetric, select the new handle, deselect any vertex, and return true when Ctrl is held', () => {
    // mock — v1 is a plain corner (no tangent on either side) of its one connected segment
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ ctrlKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
    expect(ctx.dispatch).toHaveBeenCalledWith(updateNode({ changes: { vertexHandleModes: { v1: 'symmetric' } }, id: nodeId }));
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should arm the vector-handle drag from a corner vertex when Meta (macOS Cmd) is held instead of Ctrl', () => {
    // mock — v1 is a plain corner (no tangent on either side) of its one connected segment
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ metaKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
  });

  it('should return undefined when neither Ctrl nor Meta is held', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ point: { x: 2, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when the point misses every vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 900, y: 900 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should treat the hit vertex as the segment’s end when it’s the endId rather than the startId', () => {
    // mock — v1 is the endId of its one connected segment, not the startId
    const nodeId = addVectorNode(
      { s1: { endId: 'v1', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'end', nodeId, segmentId: 's1', vertexId: 'v1' });
  });

  it('should return undefined when the hit vertex has no connected segment', () => {
    // mock — an isolated vertex, e.g. left behind by a Pen-tool click that was never connected
    const nodeId = addVectorNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 0, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(ctx.selectionRefs.pendingVectorCornerHandleDragRef.current).toBeNull();
  });

  it('should arm a pending ambiguous corner-handle drag, writing nothing to the store yet, when 2+ segments touch the hit vertex', () => {
    // mock — v1 is shared by s1 (toward v2, "right") and s2 (toward v3, "down")
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 0, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 0, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).not.toHaveBeenCalled();
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(ctx.selectionRefs.pendingVectorCornerHandleDragRef.current).toEqual({
      candidates: [
        { angle: 0, end: 'start', segmentId: 's1' },
        { angle: 90, end: 'start', segmentId: 's2' },
      ],
      dragStart: { x: 0, y: 0 },
      nodeId,
      vertexId: 'v1',
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });
});

describe('armVectorBendSegmentOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should reveal straight-line default tangents on both ends, mark both endpoints symmetric, select only the segment (so its tangent handles render), arm a bend drag remembering the original (null) tangents for an Escape-revert, and return true when Ctrl is held over a plain straight segment', () => {
    // mock — v1(0,0)-v2(100,0), plain straight segment, no tangents yet
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs({
      selectedVectorSegmentIdsRef: { current: ['s1'] },
      selectedVectorVertexIdsRef: { current: ['v1'] },
    });

    // before — click well inside the segment, away from either endpoint
    const ctx = createContext({ canvasRefs, event: pointerEvent({ ctrlKey: true }), point: { x: 25, y: 0 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).toHaveBeenCalledWith(
      updateNode({
        changes: {
          segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -100 / 3, y: 0 }, tangentStart: { x: 100 / 3, y: 0 } } },
          vertexHandleModes: { v1: 'symmetric', v2: 'symmetric' },
        },
        id: nodeId,
      }),
    );
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toEqual({
      dragStart: { x: 25, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -100 / 3, y: 0 },
      tangentStart: { x: 100 / 3, y: 0 },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should arm the bend drag when Meta (macOS Cmd) is held instead of Ctrl', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ metaKey: true }), point: { x: 25, y: 0 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toMatchObject({ nodeId, segmentId: 's1' });
  });

  it('should arm the bend drag when the Bend tool is the active tool, even with neither Ctrl nor Meta held', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setActiveTool(ToolName.bend));

    // before
    const ctx = createContext({ point: { x: 25, y: 0 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toMatchObject({ nodeId, segmentId: 's1' });
  });

  it('should use the segment’s own existing tangents as the baseline (not reset to straight) when it’s already curved, remembering them as the original for an Escape-revert', () => {
    // mock — s1 already has a real, non-default tangent on each end
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -10, y: 5 }, tangentStart: { x: 10, y: -5 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 25, y: 0 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toMatchObject({
      originalTangentEnd: { x: -10, y: 5 },
      originalTangentStart: { x: 10, y: -5 },
      tangentEnd: { x: -10, y: 5 },
      tangentStart: { x: 10, y: -5 },
    });
  });

  it('should return undefined when neither Ctrl nor Meta is held', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ point: { x: 25, y: 0 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toBeNull();
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when the point misses every segment', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 900, y: 900 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toBeNull();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 25, y: 0 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toBeNull();
  });

  it('should arm a pending ambiguous bend, writing nothing to the store yet, when the click lands where two segments both come within the edge-hit tolerance of a shared vertex', () => {
    // mock — v1 is shared by s1 (toward v2, "right") and s2 (toward v3, "down"); clicking at (5,5) is just
    // past the 6px vertex-hit radius around v1, but still within the 6px edge-hit tolerance of both
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 0, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 5, y: 5 } });

    // result
    expect(armVectorBendSegmentOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).not.toHaveBeenCalled();
    expect(ctx.selectionRefs.vectorSegmentBendDragRef.current).toEqual({
      candidates: [
        { angle: 0, segmentId: 's1' },
        { angle: 90, segmentId: 's2' },
      ],
      dragStart: { x: 5, y: 5 },
      nodeId,
      status: 'pending',
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });
});

describe('armVectorVertexOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm the vector-vertex drag, select the vertex, deselect any tangent handle, and return true when a vertex is hit', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toEqual({
      nodeId,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 2, y: 0 },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should keep the whole multi-selection and arm a group drag with a pending collapse when clicking an already-selected vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 2, y: 0 } });

    // result — the selection is left untouched at pointerdown time; only released-without-moving resolves
    // the collapse (see disarmVectorMultiDrag.spec.ts)
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toBeNull();
    expect(ctx.canvasRefs.vectorMultiDragRef.current).toMatchObject({
      pendingClickAction: { id: 'v1', kind: 'vertex' },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
    });
  });

  it('should toggle the vertex into the multi-selection on shift+click, without arming a drag or touching the handle selection', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toBeNull();
    expect(ctx.canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should toggle an already-selected vertex back out of the multi-selection on a second shift+click', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v2']);
  });

  it('should return undefined when the point misses every vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

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

describe('armVectorMultiSelectBoxOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm a group drag and return true when clicking inside the bounding box of 2+ selected vertices, away from any single point', () => {
    // mock — v1(0,0), v2(100,100) selected, click at their shared bounding box's center
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiDragRef.current).toEqual({
      boxOrigin: { height: 100, width: 100, x: 0, y: 0 },
      handleOrigins: {},
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 50, y: 50 },
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 100 } },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when shift is held, letting the click fall through to the plain toggle resolvers', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiDragRef.current).toBeNull();
  });

  it('should return undefined when fewer than 2 points are selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when the point falls outside the selection bounding box', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 900, y: 900 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBeUndefined();
  });
});

describe('armVectorMultiSelectResizeOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm a resize drag and return true when clicking exactly on a corner of the bounding box of 2+ selected vertices', () => {
    // mock — v1(0,0), v2(100,100) selected, bounds corners at (0,0)/(100,0)/(100,100)/(0,100); click on "se"
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 100 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBe(true);
    // the 'se' handle anchors from the opposite ('nw') corner, (0,0), which stays put under a 0deg
    // rotation, so anchorWorld lands on that same (0,0) point
    expect(ctx.canvasRefs.vectorMultiSelectResizeDragRef.current).toEqual({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: {},
      liveBounds: { height: 100, width: 100, x: 0, y: 0 },
      rotation: 0,
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 100 } },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when fewer than 2 points are selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 100 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelectResizeDragRef.current).toBeNull();
  });

  it('should return undefined when the point misses every handle zone', () => {
    // mock — well inside the box, away from any corner/edge
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 100, y: 100 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined for a corner click that lands just outside the box — reserved for the rotate ring instead, since a diagonal 2-point selection’s own vertices commonly sit exactly on these corners', () => {
    // mock — v1(0,0), v2(100,100) selected; click 3px outside the "se" corner (100,100)
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 103, y: 103 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelectResizeDragRef.current).toBeNull();
  });
});

describe('armVectorMultiSelectRotateOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm a rotate drag and return true when clicking in the ring just outside a corner of the bounding box of 2+ selected vertices', () => {
    // mock — v1(0,0), v2(100,100) selected; click 10px below the "se" corner (100,100), inside the
    // 6-16px annulus around it and outside the box itself
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiSelectRotateDragRef.current).toMatchObject({ pivot: { x: 50, y: 50 } });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when fewer than 2 points are selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelectRotateDragRef.current).toBeNull();
  });

  it('should return undefined when the point misses the ring entirely', () => {
    // mock — well inside the box, away from any corner
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBeUndefined();
  });

  it('should arm a rotate drag for a corner click that lands just outside the box, even though it would fall inside the ordinary 6px resize-corner radius — the case armVectorMultiSelectResizeOnPointerDown now refuses', () => {
    // mock — v1(0,0), v2(100,100) selected; click 3px outside the "se" corner (100,100)
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 103, y: 103 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiSelectRotateDragRef.current).toMatchObject({ pivot: { x: 50, y: 50 } });
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBeUndefined();
  });
});

describe('armVectorSegmentOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should select the segment and deselect any vertex/handle when a segment interior is hit', () => {
    // mock — v1(0,0)-v2(100,0), click well away from either endpoint
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];
    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 25, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should return undefined when the point misses every segment', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ point: { x: 900, y: 900 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 25, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBeUndefined();
  });

  it('should add the segment to the selection on shift-click without touching vertex/handle selection', () => {
    // mock
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 200, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];
    canvasRefs.selectedVectorVertexIdsRef.current = ['v3'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 150, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1', 's2']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v3']);
  });

  it('should remove the segment from the selection on shift-click when it is already selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 25, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should keep the whole multi-selection and arm a drag of every selected segment when clicking an already-selected segment', () => {
    // mock
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 200, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    canvasRefs.selectedVectorSegmentIdsRef.current = ['s1', 's2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 25, y: 0 }, selectionRefs });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1', 's2']);
    expect(ctx.canvasRefs.vectorMultiDragRef.current?.vertexOrigins).toEqual({
      v1: { x: 0, y: 0 },
      v2: { x: 100, y: 0 },
      v3: { x: 200, y: 0 },
    });
  });

  it('should select just the clicked segment and arm a drag of its own two vertices when it was not already selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    // before
    const ctx = createContext({ canvasRefs, point: { x: 25, y: 0 }, selectionRefs });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(ctx.canvasRefs.vectorMultiDragRef.current?.vertexOrigins).toEqual({ v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } });
  });

  it('should also arm a pending split-segment click action when the click lands precisely on the segment’s own fixed midpoint, so a plain click (no drag) splits it instead of leaving it selected', () => {
    // mock — resolved on release by disarmVectorMultiDrag.ts, not here; this only checks the arm-time state
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const selectionRefs = createSelectionToolRefs();

    // before — click exactly on the segment's own midpoint (50,0)
    const ctx = createContext({ point: { x: 50, y: 0 }, selectionRefs });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiDragRef.current?.pendingClickAction).toEqual({
      kind: 'split-segment',
      nodeId,
      segmentId: 's1',
      t: 0.5,
    });
  });

  it('should NOT arm a pending split-segment click action when the click lands elsewhere on the segment, away from its own fixed midpoint — a plain click there just leaves the segment selected, same as before this feature existed', () => {
    // mock — "muszę kliknąć w ten point konkretnie, a nie że klikam w segment i mi się robi środkowy point"
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    // before — click near x=25, well off the segment's own midpoint (50,0) but still on the segment itself
    const ctx = createContext({ canvasRefs, point: { x: 25, y: 0 }, selectionRefs });

    // result — the segment is still selected (eager, arm-time write), but no split is pending for release
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(ctx.canvasRefs.vectorMultiDragRef.current?.pendingClickAction).toBeNull();
  });
});
