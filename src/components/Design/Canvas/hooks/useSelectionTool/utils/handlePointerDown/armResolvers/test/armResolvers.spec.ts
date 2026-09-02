// store
import {
  addNode,
  groupNodes,
  setActiveTool,
  setPaint,
  setPenActiveVertexId,
  setSelection,
  setVectorEditingNodeIds,
  updateNode,
} from 'store/design/slice';
import { DEFAULT_PAINT, DEFAULT_PAINT_COLOR } from 'store/design/constants';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
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
import { armGroupChildToggleOnPointerDown } from '../armGroupChildToggleOnPointerDown';
import { armHitOnPointerDown } from '../armHitOnPointerDown';
import { armLineEndpointOnPointerDown } from '../armLineEndpointOnPointerDown';
import { armMarqueeOnPointerDown } from '../armMarqueeOnPointerDown';
import { armPathOffsetOnPointerDown } from '../armPathOffsetOnPointerDown';
import { armPolygonCornerRadiusOnPointerDown } from '../armPolygonCornerRadiusOnPointerDown';
import { armPolygonVertexCountOnPointerDown } from '../armPolygonVertexCountOnPointerDown';
import { armResizeOnPointerDown } from '../armResizeOnPointerDown';
import { armRotateOnPointerDown } from '../armRotateOnPointerDown';
import { armSelectedTextBoundsOnPointerDown } from '../armSelectedTextBoundsOnPointerDown';
import { armSelectedVectorBoundsOnPointerDown } from '../armSelectedVectorBoundsOnPointerDown';
import { armStarCornerRadiusOnPointerDown } from '../armStarCornerRadiusOnPointerDown';
import { armStarRatioOnPointerDown } from '../armStarRatioOnPointerDown';
import { armStarVertexCountOnPointerDown } from '../armStarVertexCountOnPointerDown';
import { armVectorBendSegmentOnPointerDown } from '../armVectorBendSegmentOnPointerDown';
import { armVectorCornerHandleOnPointerDown } from '../armVectorCornerHandleOnPointerDown';
import { armVectorCutOnPointerDown } from '../armVectorCutOnPointerDown';
import { armVectorEraseOnPointerDown } from '../armVectorEraseOnPointerDown';
import { armVectorFaceSelectOnPointerDown } from '../armVectorFaceSelectOnPointerDown';
import { armVectorHandleOnPointerDown } from '../armVectorHandleOnPointerDown/armVectorHandleOnPointerDown';
import { armVectorLassoOnPointerDown } from '../armVectorLassoOnPointerDown/armVectorLassoOnPointerDown';
import { armVectorMarqueeOnPointerDown } from '../armVectorMarqueeOnPointerDown';
import { armVectorMultiSelectBoxOnPointerDown } from '../armVectorMultiSelectBoxOnPointerDown';
import { armVectorMultiSelectResizeOnPointerDown } from '../armVectorMultiSelectResizeOnPointerDown';
import { armVectorMultiSelectRotateOnPointerDown } from '../armVectorMultiSelectRotateOnPointerDown';
import { armVectorPaintOnPointerDown } from '../armVectorPaintOnPointerDown';
import { armVectorSegmentOnPointerDown } from '../armVectorSegmentOnPointerDown/armVectorSegmentOnPointerDown';
import { armVectorShapeBuilderOnPointerDown } from '../armVectorShapeBuilderOnPointerDown';
import { armVectorVertexOnPointerDown } from '../armVectorVertexOnPointerDown/armVectorVertexOnPointerDown';
import { armVectorWidthPointOnPointerDown } from '../armVectorWidthPointOnPointerDown/armVectorWidthPointOnPointerDown';
import { ARM_RESOLVERS } from '../../constants';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
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

  const { nodes, rootOrder } = selectActivePage(store.getState());

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

  const { nodes, rootOrder } = selectActivePage(store.getState());

  return nodes[rootOrder[rootOrder.length - 1]] as TTextNode;
};

const addVectorNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices'], rotation = 0): string => {
  store.dispatch(
    addNode({
      defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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

  const { rootOrder } = selectActivePage(store.getState());

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

const vectorNode: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
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
    v2: { id: 'v2', x: 100, y: 0 },
    v3: { id: 'v3', x: 100, y: 100 },
    v4: { id: 'v4', x: 0, y: 100 },
  },
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
    expect(ctx.canvasRefs.vertexCount.polygonVertexCountDragRef.current).toMatchObject({ nodeId: 'polygon-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 90, y: 90 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonVertexCountOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vertexCount.polygonVertexCountDragRef.current).toBeNull();
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
    expect(ctx.canvasRefs.vertexCount.starVertexCountDragRef.current).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 90, y: 90 }, selectedNodes: [star] });

    // result
    expect(armStarVertexCountOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vertexCount.starVertexCountDragRef.current).toBeNull();
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
    expect(ctx.canvasRefs.starRatio.starRatioDragRef.current).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 90, y: 90 }, selectedNodes: [star] });

    // result
    expect(armStarRatioOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.starRatio.starRatioDragRef.current).toBeNull();
  });
});

describe('armEllipseArcOnPointerDown', () => {
  it('should arm the ellipse arc (Sweep) drag and return true when its handle is hit', () => {
    // mock — default arcEndAngle (90deg) puts the Sweep handle at the east rim (100, 50)
    // before
    const ctx = createContext({ point: { x: 100, y: 50 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.ellipseArc.ellipseArcDragRef.current).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.ellipseArc.ellipseArcDragRef.current).toBeNull();
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
    expect(ctx.canvasRefs.ellipseArc.ellipseArcRotateDragRef.current).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.ellipseArc.ellipseArcRotateDragRef.current).toBeNull();
  });
});

describe('armEllipseArcRatioOnPointerDown', () => {
  it('should arm the ellipse arc Ratio drag and return true when its handle is hit', () => {
    // mock — the Ratio handle rests at dead center (50, 50) while arcRatio is 0
    // before
    const ctx = createContext({ point: { x: 50, y: 50 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcRatioOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.ellipseArc.ellipseArcRatioDragRef.current).toMatchObject({ nodeId: 'ellipse-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [ellipse] });

    // result
    expect(armEllipseArcRatioOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.ellipseArc.ellipseArcRatioDragRef.current).toBeNull();
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
    expect(ctx.canvasRefs.cornerRadius.cornerRadiusDragRef.current).toMatchObject({ nodeId: 'rectangle-1' });
  });

  it('should return undefined when the point misses every corner-radius handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [rectangle] });

    // result
    expect(armCornerRadiusOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.cornerRadius.cornerRadiusDragRef.current).toBeNull();
  });
});

describe('armPolygonCornerRadiusOnPointerDown', () => {
  it('should arm the polygon corner-radius drag and return true when its handle is hit', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); radius 15 moves it toward center
    // before
    const ctx = createContext({ point: { x: 50, y: 30 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonCornerRadiusOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.cornerRadius.polygonCornerRadiusDragRef.current).toMatchObject({ nodeId: 'polygon-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [polygon] });

    // result
    expect(armPolygonCornerRadiusOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.cornerRadius.polygonCornerRadiusDragRef.current).toBeNull();
  });
});

describe('armStarCornerRadiusOnPointerDown', () => {
  it('should arm the star corner-radius drag and return true when its handle is hit', () => {
    // mock — top vertex of a 100x100 5-point star; radius 15 moves it toward center
    // before
    const ctx = createContext({ point: { x: 50, y: 33.893272 }, selectedNodes: [star] });

    // result
    expect(armStarCornerRadiusOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.cornerRadius.starCornerRadiusDragRef.current).toMatchObject({ nodeId: 'star-1' });
  });

  it('should return undefined when the point misses the handle', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [star] });

    // result
    expect(armStarCornerRadiusOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.cornerRadius.starCornerRadiusDragRef.current).toBeNull();
  });
});

describe('armRotateOnPointerDown', () => {
  const rotatingRectangle: TRectangleNode = { ...rectangle, cornerRadius: undefined, x: 3000, y: 3000 };

  it('should arm the rotate drag and return true when the point lands in the rotate ring', () => {
    // before — just outside the resize handle radius above the "nw" corner
    const ctx = createContext({ point: { x: 3000, y: 2990 }, selectedNodes: [rotatingRectangle] });

    // result
    expect(armRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.transform.rotateDragRef.current).not.toBeNull();
  });

  it('should return undefined when the point misses the rotate ring', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [rotatingRectangle] });

    // result
    expect(armRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.transform.rotateDragRef.current).toBeNull();
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
  it('should arm a deselect-on-no-move drag and return true when the point lands inside a selected text box', () => {
    // mock — armDrag reads node origins from the real store, so the selected node must exist there
    const storedText = addTextNode(0, 0);

    // before
    const ctx = createContext({ currentSelection: [storedText.id], point: { x: 50, y: 50 }, selectedNodes: [storedText] });

    // result — released without moving, a miss-past-the-content click deselects, same as a gap click
    expect(armSelectedTextBoundsOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.dragStateRef.current?.pendingClickAction).toEqual({ kind: 'deselect' });
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

describe('armSelectedVectorBoundsOnPointerDown', () => {
  it('should arm a deselect-on-no-move drag and return true when the point lands inside a selected vector box, past its contour', () => {
    // mock — armDrag reads node origins from the real store, so the selected node must exist there
    const nodeId = addVectorNode(vectorNode.segments, vectorNode.vertices);
    const storedVector = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // before — dead center of the unfilled square, well past its contour
    const ctx = createContext({ currentSelection: [nodeId], point: { x: 50, y: 50 }, selectedNodes: [storedVector] });

    // result — released without moving, a miss-past-the-contour click deselects, same as a gap click
    expect(armSelectedVectorBoundsOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.dragStateRef.current?.pendingClickAction).toEqual({ kind: 'deselect' });
  });

  it('should return undefined when shift is held', () => {
    // before
    const ctx = createContext({ event: pointerEvent({ shiftKey: true }), point: { x: 50, y: 50 }, selectedNodes: [vectorNode] });

    // result
    expect(armSelectedVectorBoundsOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.selectionRefs.dragStateRef.current).toBeNull();
  });

  it('should return undefined when the point misses the vector bounding box', () => {
    // before
    const ctx = createContext({ point: { x: 900, y: 900 }, selectedNodes: [vectorNode] });

    // result
    expect(armSelectedVectorBoundsOnPointerDown(ctx)).toBeUndefined();
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['vertex-1'];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['segment-1'];

    // before
    const ctx = createContext({ canvasRefs, hit: null, point: { x: 42, y: 24 } });

    // result
    expect(armVectorMarqueeOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    // the pre-drag vertex/segment selection is snapshotted, not just dropped — continueVectorMarqueeDrag.ts
    // uses it to keep their tangents visible/catchable for the rest of the gesture even once deselected
    expect(canvasRefs.vectorEdit.preVectorMarqueeVertexIdsRef.current).toEqual(['vertex-1']);
    expect(canvasRefs.vectorEdit.preVectorMarqueeSegmentIdsRef.current).toEqual(['segment-1']);
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['vertex-1'];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['segment-1'];

    // before — a click that would otherwise land squarely on a node, to prove Lasso intercepts it anyway
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, hit: rectangle, point: { x: 42, y: 24 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(canvasRefs.lassoMarquee.vectorLassoPathRef.current).toEqual([{ x: 42, y: 24 }]);
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
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toBeNull();
  });

  it('should return undefined (letting the click fall through) when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.lasso });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toBeNull();
  });

  it('should return undefined (yield to the vertex-drag resolver) when the click lands exactly on an already-selected vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 0, y: 0 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toBeNull();
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1']);
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
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toEqual([{ x: 0, y: 0 }]);
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 10, y: 20 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toBeNull();
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 10, y: 20 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toEqual([{ x: 10, y: 20 }]);
  });

  it('should return undefined (yield) when the click lands on an already-selected segment', () => {
    // mock — v1(0,0)-v2(100,0), click well away from either endpoint
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 25, y: 0 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toBeNull();
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
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toEqual([{ x: 25, y: 0 }]);
  });

  it('should return undefined (yield to the multi-select box) when the click lands inside the bounding box of 2+ selected vertices', () => {
    // mock — v1(0,0), v2(100,100) selected, click at their shared bounding box's center
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorLassoOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toBeNull();
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
  });

  it('should still start a fresh lasso path when the click falls outside the multi-select box of 2+ selected vertices', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ activeTool: ToolName.lasso, canvasRefs, point: { x: 900, y: 900 } });

    // result — clears the pre-existing v1/v2 selection, exactly like starting any other fresh lasso
    expect(armVectorLassoOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(ctx.canvasRefs.lassoMarquee.vectorLassoPathRef.current).toEqual([{ x: 900, y: 900 }]);
  });
});

describe('armVectorPaintOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPaint(DEFAULT_PAINT));
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
    expect(action.payload.changes).toEqual({
      fillByKey: { 's1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]': [{ color: DEFAULT_PAINT_COLOR, opacity: 100, type: 'solid' }] },
      filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'],
    });
  });

  it('should pin the paint-add cursor and seed the touched-faces highlight with the clicked face when the click hits one', () => {
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
    expect(ctx.setClassName).toHaveBeenCalledWith('paint-add');
    expect(ctx.canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current).toEqual({ [nodeId]: ['s1,s2,s3'] });
  });

  it('should still pin the paint-add cursor and clear the touched-faces highlight when the click misses every face', () => {
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
    expect(ctx.setClassName).toHaveBeenCalledWith('paint-add');
    expect(ctx.canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current).toEqual({});
  });

  it('should fill the clicked face with the current paint color from the store, not the default', () => {
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
    store.dispatch(setPaint({ color: '#ff0000', opacity: 100, type: 'solid' }));

    // before — a point inside the triangle
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 50, y: 40 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;

    expect(action.payload.changes).toEqual({
      fillByKey: { 's1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]': [{ color: '#ff0000', opacity: 100, type: 'solid' }] },
      filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'],
    });
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
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] }, id: nodeId }));

    // before
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 50, y: 40 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;

    expect(action.payload.changes).toEqual({ filledFaceKeys: [] });
  });

  it('should pin the paint-remove cursor and arm remove mode when the click hits an already-filled face', () => {
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
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] }, id: nodeId }));

    // before
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 50, y: 40 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);
    expect(ctx.setClassName).toHaveBeenCalledWith('paint-remove');
    expect(ctx.canvasRefs.vectorPaint.isVectorPaintRemoveRef.current).toBe(true);
  });

  it('should arm add mode (not remove) when the click misses every face', () => {
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
    expect(ctx.canvasRefs.vectorPaint.isVectorPaintRemoveRef.current).toBe(false);
  });

  it('should record the clicked face as an explicit hole of the already-filled ancestor it sits inside, inheriting that ancestor’s color instead of the palette’s current paint color', () => {
    // mock — A is a big filled square; B is a smaller, fully disjoint square nested inside it, unfilled.
    // A spot that already looks filled (because A covers it) must cut a real, tracked hole rather than
    // just adding B with whatever color happens to be selected in the palette.
    const nodeId = addVectorNode(
      {
        sa1: { endId: 'a2', id: 'sa1', startId: 'a1', tangentEnd: null, tangentStart: null },
        sa2: { endId: 'a3', id: 'sa2', startId: 'a2', tangentEnd: null, tangentStart: null },
        sa3: { endId: 'a4', id: 'sa3', startId: 'a3', tangentEnd: null, tangentStart: null },
        sa4: { endId: 'a1', id: 'sa4', startId: 'a4', tangentEnd: null, tangentStart: null },
        sb1: { endId: 'b2', id: 'sb1', startId: 'b1', tangentEnd: null, tangentStart: null },
        sb2: { endId: 'b3', id: 'sb2', startId: 'b2', tangentEnd: null, tangentStart: null },
        sb3: { endId: 'b4', id: 'sb3', startId: 'b3', tangentEnd: null, tangentStart: null },
        sb4: { endId: 'b1', id: 'sb4', startId: 'b4', tangentEnd: null, tangentStart: null },
      },
      {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 200, y: 0 },
        a3: { id: 'a3', x: 200, y: 200 },
        a4: { id: 'a4', x: 0, y: 200 },
        b1: { id: 'b1', x: 50, y: 50 },
        b2: { id: 'b2', x: 100, y: 50 },
        b3: { id: 'b3', x: 100, y: 100 },
        b4: { id: 'b4', x: 50, y: 100 },
      },
    );
    const aKey = 'sa1[v:a1|v:a2],sa2[v:a2|v:a3],sa3[v:a3|v:a4],sa4[v:a1|v:a4]';
    const bKey = 'sb1[v:b1|v:b2],sb2[v:b2|v:b3],sb3[v:b3|v:b4],sb4[v:b1|v:b4]';

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(
      updateNode({
        changes: { fillByKey: { [aKey]: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }] }, filledFaceKeys: [aKey] },
        id: nodeId,
      }),
    );
    store.dispatch(setPaint({ color: '#ff0000', opacity: 100, type: 'solid' }));

    // before — click inside B, which sits fully inside A's already-filled area
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 75, y: 75 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual(expect.arrayContaining([aKey, bKey]));
    expect(changes.fillByKey?.[bKey]).toEqual([{ color: '#d9d9d9', opacity: 100, type: 'solid' }]);
    expect(changes.holeParentByKey).toEqual({ [bKey]: aKey });
  });

  it('should promote a nested unfilled loop to an explicit fill inheriting the removed ancestor’s color, when un-painting a filled face that has an unfilled loop nested inside it', () => {
    // mock — A is a big filled square; B is a smaller, fully disjoint square nested inside it, unfilled.
    // Clicking A's own area (not B's) un-paints A, so B — no longer covered by an ancestor's fill —
    // must be promoted to its own explicit fill carrying A's old color, or it would silently vanish.
    const nodeId = addVectorNode(
      {
        sa1: { endId: 'a2', id: 'sa1', startId: 'a1', tangentEnd: null, tangentStart: null },
        sa2: { endId: 'a3', id: 'sa2', startId: 'a2', tangentEnd: null, tangentStart: null },
        sa3: { endId: 'a4', id: 'sa3', startId: 'a3', tangentEnd: null, tangentStart: null },
        sa4: { endId: 'a1', id: 'sa4', startId: 'a4', tangentEnd: null, tangentStart: null },
        sb1: { endId: 'b2', id: 'sb1', startId: 'b1', tangentEnd: null, tangentStart: null },
        sb2: { endId: 'b3', id: 'sb2', startId: 'b2', tangentEnd: null, tangentStart: null },
        sb3: { endId: 'b4', id: 'sb3', startId: 'b3', tangentEnd: null, tangentStart: null },
        sb4: { endId: 'b1', id: 'sb4', startId: 'b4', tangentEnd: null, tangentStart: null },
      },
      {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 200, y: 0 },
        a3: { id: 'a3', x: 200, y: 200 },
        a4: { id: 'a4', x: 0, y: 200 },
        b1: { id: 'b1', x: 50, y: 50 },
        b2: { id: 'b2', x: 100, y: 50 },
        b3: { id: 'b3', x: 100, y: 100 },
        b4: { id: 'b4', x: 50, y: 100 },
      },
    );
    const aKey = 'sa1[v:a1|v:a2],sa2[v:a2|v:a3],sa3[v:a3|v:a4],sa4[v:a1|v:a4]';
    const bKey = 'sb1[v:b1|v:b2],sb2[v:b2|v:b3],sb3[v:b3|v:b4],sb4[v:b1|v:b4]';

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(
      updateNode({
        changes: { fillByKey: { [aKey]: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }] }, filledFaceKeys: [aKey] },
        id: nodeId,
      }),
    );

    // before — click inside A but outside B, on the already-filled face itself
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 25, y: 25 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([bKey]);
    expect(changes.fillByKey?.[bKey]).toEqual([{ color: '#d9d9d9', opacity: 100, type: 'solid' }]);
  });

  it('should also paint every unfilled loop nested inside the clicked face with the same new color, when the clicked face itself contains further unfilled loops', () => {
    // mock — M is the clicked (unfilled) square; I is a smaller, fully disjoint square nested inside
    // it, also unfilled. Painting M must sweep I along with it, in M's own new color.
    const nodeId = addVectorNode(
      {
        si1: { endId: 'i2', id: 'si1', startId: 'i1', tangentEnd: null, tangentStart: null },
        si2: { endId: 'i3', id: 'si2', startId: 'i2', tangentEnd: null, tangentStart: null },
        si3: { endId: 'i4', id: 'si3', startId: 'i3', tangentEnd: null, tangentStart: null },
        si4: { endId: 'i1', id: 'si4', startId: 'i4', tangentEnd: null, tangentStart: null },
        sm1: { endId: 'm2', id: 'sm1', startId: 'm1', tangentEnd: null, tangentStart: null },
        sm2: { endId: 'm3', id: 'sm2', startId: 'm2', tangentEnd: null, tangentStart: null },
        sm3: { endId: 'm4', id: 'sm3', startId: 'm3', tangentEnd: null, tangentStart: null },
        sm4: { endId: 'm1', id: 'sm4', startId: 'm4', tangentEnd: null, tangentStart: null },
      },
      {
        i1: { id: 'i1', x: 30, y: 30 },
        i2: { id: 'i2', x: 60, y: 30 },
        i3: { id: 'i3', x: 60, y: 60 },
        i4: { id: 'i4', x: 30, y: 60 },
        m1: { id: 'm1', x: 0, y: 0 },
        m2: { id: 'm2', x: 100, y: 0 },
        m3: { id: 'm3', x: 100, y: 100 },
        m4: { id: 'm4', x: 0, y: 100 },
      },
    );
    const mKey = 'sm1[v:m1|v:m2],sm2[v:m2|v:m3],sm3[v:m3|v:m4],sm4[v:m1|v:m4]';
    const iKey = 'si1[v:i1|v:i2],si2[v:i2|v:i3],si3[v:i3|v:i4],si4[v:i1|v:i4]';

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPaint({ color: '#ff0000', opacity: 100, type: 'solid' }));

    // before — click inside M but outside I
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 10, y: 10 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual(expect.arrayContaining([mKey, iKey]));
    expect(changes.fillByKey?.[mKey]).toEqual([{ color: '#ff0000', opacity: 100, type: 'solid' }]);
    expect(changes.fillByKey?.[iKey]).toEqual([{ color: '#ff0000', opacity: 100, type: 'solid' }]);
  });

  it('should bake a crossing the clicked face depends on into a real, persisted vertex (regression: painting across a crossing that only existed virtually made the fill disappear the moment the node was cut later)', () => {
    // mock — a square (a-b-c-d) plus a separate horizontal line crossing its left and right edges, both
    // living in the same node's segments/vertices, exactly like drawing a second Pen stroke across an
    // existing shape — the crossing only exists virtually (render-time planarization) until this paint
    const nodeId = addVectorNode(
      {
        line1: { endId: 'p2', id: 'line1', startId: 'p1', tangentEnd: null, tangentStart: null },
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
        p1: { id: 'p1', x: -20, y: 50 },
        p2: { id: 'p2', x: 120, y: 50 },
      },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before — click inside the top half, above the crossing line
    const ctx = createContext({ activeTool: ToolName.paint, point: { x: 50, y: 25 } });

    // result
    expect(armVectorPaintOnPointerDown(ctx)).toBe(true);

    const action = (ctx.dispatch as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<typeof updateNode>;
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toHaveLength(1);
    expect(changes.segments).toBeDefined();
    expect(changes.vertices).toBeDefined();

    const originalVertexIds = new Set(['a', 'b', 'c', 'd', 'p1', 'p2']);
    const newVertexIds = Object.keys(changes.vertices!).filter((id) => !originalVertexIds.has(id));

    // one shared, real vertex per crossing (s2xline1, s4xline1) — not a synthetic "x:...:...:..." id
    expect(newVertexIds).toHaveLength(2);
    newVertexIds.forEach((id) => expect(id).not.toContain(':'));

    // both crossed segments split around the shared real vertex, and are still there to be re-cut later
    expect(Object.keys(changes.segments!).sort()).toEqual(
      ['s1', 's2#0', 's2#1', 's3', 's4#0', 's4#1', 'line1#0', 'line1#1', 'line1#2'].sort(),
    );
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

describe('armVectorFaceSelectOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  const triangleFaceKey = 's1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]';

  const addFilledTriangle = (): string => {
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    );

    store.dispatch(updateNode({ changes: { filledFaceKeys: [triangleFaceKey] }, id: nodeId }));

    return nodeId;
  };

  it('should select every vertex of a clicked filled face, replacing the current selection', () => {
    // mock
    const nodeId = addFilledTriangle();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['stale'];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 'stale' }];
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['stale'];

    // before — a point inside the triangle
    const ctx = createContext({ activeTool: ToolName.move, canvasRefs, point: { x: 50, y: 40 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.sort()).toEqual(['v1', 'v2', 'v3']);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should arm a group drag of the newly selected vertices immediately, so a click-and-drag in one gesture works without a separate second click', () => {
    // mock
    const nodeId = addFilledTriangle();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ activeTool: ToolName.move, canvasRefs, point: { x: 50, y: 40 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current).not.toBeNull();
    expect(Object.keys(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current!.vertexOrigins).sort()).toEqual(['v1', 'v2', 'v3']);
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current!.pendingClickAction).toBeNull();
  });

  it('should add the face vertices to the current selection on a shift-click, without clearing it', () => {
    // mock
    const nodeId = addFilledTriangle();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['other-vertex'];

    // before
    const ctx = createContext({
      activeTool: ToolName.move,
      canvasRefs,
      event: pointerEvent({ shiftKey: true }),
      point: { x: 50, y: 40 },
    });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.sort()).toEqual(['other-vertex', 'v1', 'v2', 'v3'].sort());
  });

  it('should keep the current selection unchanged when shift-clicking a face whose vertices are already all selected', () => {
    // mock
    const nodeId = addFilledTriangle();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2', 'v3'];

    // before
    const ctx = createContext({
      activeTool: ToolName.move,
      canvasRefs,
      event: pointerEvent({ shiftKey: true }),
      point: { x: 50, y: 40 },
    });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.sort()).toEqual(['v1', 'v2', 'v3']);
  });

  it('should keep a shared divider vertex selected when shift-clicking a second, adjacent filled face (regression: a per-vertex toggle dropped it, freezing the divider on a later group drag)', () => {
    // mock — a square split into a top and bottom half by an internal divider s7 (v3<->v6), both halves filled
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v5', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
        s5: { endId: 'v6', id: 's5', startId: 'v5', tangentEnd: null, tangentStart: null },
        s6: { endId: 'v1', id: 's6', startId: 'v6', tangentEnd: null, tangentStart: null },
        s7: { endId: 'v6', id: 's7', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 100, y: 50 },
        v4: { id: 'v4', x: 100, y: 100 },
        v5: { id: 'v5', x: 0, y: 100 },
        v6: { id: 'v6', x: 0, y: 50 },
      },
    );

    const filledFaceKeys = deriveVectorFaces(
      store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode,
    ).map((face) => getVectorFillLoopKey(face.pieceKeys));

    store.dispatch(updateNode({ changes: { filledFaceKeys }, id: nodeId }));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — click the top half, then shift-click the bottom half; both share divider vertices v3/v6
    const topCtx = createContext({ activeTool: ToolName.move, canvasRefs, point: { x: 60, y: 25 } });

    expect(armVectorFaceSelectOnPointerDown(topCtx)).toBe(true);

    const bottomCtx = createContext({
      activeTool: ToolName.move,
      canvasRefs,
      event: pointerEvent({ shiftKey: true }),
      point: { x: 60, y: 75 },
    });

    // result
    expect(armVectorFaceSelectOnPointerDown(bottomCtx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.sort()).toEqual(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']);
  });

  it('should persist a virtual crossing into a real vertex before selecting, then include it in the selection', () => {
    // mock — a square (a-b-c-d) plus a separate horizontal line crossing its left and right edges, the
    // crossing only exists virtually (render-time planarization) until this click, mirroring Paint's own
    // crossing-persistence regression test
    const nodeId = addVectorNode(
      {
        line1: { endId: 'p2', id: 'line1', startId: 'p1', tangentEnd: null, tangentStart: null },
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
        p1: { id: 'p1', x: -20, y: 50 },
        p2: { id: 'p2', x: 120, y: 50 },
      },
    );

    const filledFaceKeys = deriveVectorFaces(
      store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode,
    ).map((face) => getVectorFillLoopKey(face.pieceKeys));

    store.dispatch(updateNode({ changes: { filledFaceKeys }, id: nodeId }));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before — click inside the top half, above the crossing line
    const ctx = createContext({ activeTool: ToolName.move, point: { x: 50, y: 25 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBe(true);
    expect(ctx.dispatch).toHaveBeenCalledTimes(1);

    const originalVertexIds = new Set(['a', 'b', 'c', 'd', 'p1', 'p2']);
    const selectedVertexIds = ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;

    expect(selectedVertexIds).toContain('a');
    expect(selectedVertexIds).toContain('b');
    expect(selectedVertexIds.some((id) => !originalVertexIds.has(id))).toBe(true);
  });

  it('should select every vertex of a clicked face that has no fill', () => {
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

    // before
    const ctx = createContext({ activeTool: ToolName.move, point: { x: 50, y: 40 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.sort()).toEqual(['v1', 'v2', 'v3']);
  });

  it('should return undefined when the click misses every face', () => {
    // mock
    const nodeId = addFilledTriangle();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before — a point well outside the triangle
    const ctx = createContext({ activeTool: ToolName.move, point: { x: 500, y: 500 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Move is not the active tool', () => {
    // mock
    const nodeId = addFilledTriangle();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.default, point: { x: 50, y: 40 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.move, point: { x: 50, y: 40 } });

    // result
    expect(armVectorFaceSelectOnPointerDown(ctx)).toBeUndefined();
  });
});

describe('armVectorCutOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm a pending cut drag with the hit when a segment is hit, with Cut active', () => {
    // mock — a(0,0)->b(100,0), clicked at its own midpoint
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const selectionRefs = createSelectionToolRefs();
    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ activeTool: ToolName.cut, canvasRefs, point: { x: 50, y: 0 }, selectionRefs });

    // result
    expect(armVectorCutOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorCutDragRef.current).toMatchObject({
      hit: { nodeId, segmentId: 's1', t: 0.5 },
      status: 'pending',
    });
    expect(ctx.canvasRefs.vectorCut.vectorCutPreviewRef.current).toEqual({
      crossings: [],
      lineEnd: { x: 50, y: 0 },
      lineStart: { x: 50, y: 0 },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(ctx.setClassName).toHaveBeenCalledWith('cut-on');
  });

  it('should still arm a pending cut drag, with hit: null, when the click misses every segment — a Divide drag can start from empty space, inside a shape, or anywhere else, not just exactly on a path', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const selectionRefs = createSelectionToolRefs();
    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ activeTool: ToolName.cut, canvasRefs, point: { x: 500, y: 500 }, selectionRefs });

    // result
    expect(armVectorCutOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorCutDragRef.current).toEqual({ hit: null, lineStart: { x: 500, y: 500 }, status: 'pending' });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should return undefined when Cut is not the active tool', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.default, point: { x: 50, y: 0 } });

    // result
    expect(armVectorCutOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.cut, point: { x: 50, y: 0 } });

    // result
    expect(armVectorCutOnPointerDown(ctx)).toBeUndefined();
  });
});

describe('armVectorEraseOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should start recording the brush path, capture the pointer and set the cursor — without touching geometry — when Erase is active', () => {
    // mock — a(0,0)->b(100,0)
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const selectionRefs = createSelectionToolRefs();
    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ activeTool: ToolName.erase, canvasRefs, point: { x: 50, y: 0 }, selectionRefs });

    // result
    expect(armVectorEraseOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorEraseDragRef.current).toEqual({ axisLock: null, lastPoint: { x: 50, y: 0 }, shiftAnchor: null });
    expect(ctx.canvasRefs.vectorErase.vectorEraseStrokeRef.current).toEqual([{ x: 50, y: 0 }]);
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(ctx.setClassName).toHaveBeenCalledWith('erase');
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when Erase is not the active tool', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.default, point: { x: 50, y: 0 } });

    // result
    expect(armVectorEraseOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.erase, point: { x: 50, y: 0 } });

    // result
    expect(armVectorEraseOnPointerDown(ctx)).toBeUndefined();
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should keep the whole multi-selection and arm a group drag with a pending collapse when clicking an already-selected handle', () => {
    // mock — the handle is already selected directly, alongside an unrelated selected vertex
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 10, y: 20 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 10, y: 20 } });

    // result — the selection is left untouched at pointerdown time; only released-without-moving resolves
    // the collapse (see disarmVectorMultiDrag.spec.ts)
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v2']);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current).toMatchObject({
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
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

    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 10, y: 20 } });

    // result
    expect(armVectorHandleOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ ctrlKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorCornerHandleOnPointerDown(ctx)).toBe(true);
    expect(ctx.selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
    expect(ctx.dispatch).toHaveBeenCalledWith(updateNode({ changes: { vertexHandleModes: { v1: 'symmetric' } }, id: nodeId }));
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
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
      vectorEdit: {
        selectedVectorSegmentIdsRef: { current: ['s1'] },
        selectedVectorVertexIdsRef: { current: ['v1'] },
      },
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
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
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

    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toEqual({
      dispatchThrottle: { frameId: null, run: null },
      nodeId,
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 2, y: 0 },
    });
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should populate draggedVectorFillFacesRef when the grabbed vertex touches a currently-filled face', () => {
    // mock — a filled square
    const segments: TVectorNode['segments'] = {
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
      s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
    };
    const vertices: TVectorNode['vertices'] = {
      v1: { id: 'v1', x: 0, y: 0 },
      v2: { id: 'v2', x: 100, y: 0 },
      v3: { id: 'v3', x: 100, y: 100 },
      v4: { id: 'v4', x: 0, y: 100 },
    };
    const nodeId = addVectorNode(segments, vertices);
    const bareNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));

    store.dispatch(updateNode({ changes: { filledFaceKeys }, id: nodeId }));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ canvasRefs, point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current?.[nodeId]).toHaveLength(1);
  });

  it('should keep the whole multi-selection and arm a group drag with a pending collapse when clicking an already-selected vertex', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 2, y: 0 } });

    // result — the selection is left untouched at pointerdown time; only released-without-moving resolves
    // the collapse (see disarmVectorMultiDrag.spec.ts)
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1', 'v2']);
    expect(ctx.selectionRefs.vectorVertexDragRef.current).toBeNull();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current).toMatchObject({
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

    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 2, y: 0 } });

    // result
    expect(armVectorVertexOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v2']);
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current).toEqual({
      boxOrigin: { height: 100, width: 100, x: 0, y: 0 },
      dispatchThrottle: { frameId: null, run: null },
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 50, y: 50 } });

    // result
    expect(armVectorMultiSelectBoxOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current).toBeNull();
  });

  it('should return undefined when fewer than 2 points are selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 100 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBe(true);
    // the 'se' handle anchors from the opposite ('nw') corner, (0,0), which stays put under a 0deg
    // rotation, so anchorWorld lands on that same (0,0) point
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toEqual({
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 100 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toBeNull();
  });

  it('should return undefined when the point misses every handle zone', () => {
    // mock — well inside the box, away from any corner/edge
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 103, y: 103 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toBeNull();
  });

  it('should return undefined for a shift+click on a resize-handle position instead of arming a resize — shift always means "toggle selection", regardless of where it lands', () => {
    // mock — same v1(0,0)/v2(100,100) "se"-corner setup as the first test above, but with shiftKey held
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 100, y: 100 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toBeNull();
  });

  it('should return undefined when the point lands on an already-selected segment that happens to coincide with a resize-handle position — the whole-selection drag must win, not a resize (real reported bug: a triangle’s v1-v2 segment midpoint sits exactly on the multi-select box’s own north-edge handle)', () => {
    // mock — v1(900,300), v2(1050,300), v3(1050,450); s1(v1-v2)/s2(v2-v3) both selected, so the box
    // spans (900,300)-(1050,450) and its north-edge handle sits at (975,300) — the exact midpoint of s1
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 900, y: 300 }, v2: { id: 'v2', x: 1050, y: 300 }, v3: { id: 'v3', x: 1050, y: 450 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1', 's2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 975, y: 300 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toBeNull();
  });

  it('should return undefined for a click on a corner of a zero-height bounding box — a lasso-selected pair of same-row vertices has no meaningful resize on that axis (scale is always locked to 1), so the click must fall through to the vertex resolver and move the selection instead', () => {
    // mock — v1(900,300), v2(1050,300) both selected: bounds height is 0, so its "nw"/"sw" corners
    // both coincide exactly with v1's own position
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 900, y: 300 }, v2: { id: 'v2', x: 1050, y: 300 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 900, y: 300 } });

    // result
    expect(armVectorMultiSelectResizeOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toBeNull();
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current).toMatchObject({ pivot: { x: 50, y: 50 } });
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current).toBeNull();
  });

  it('should return undefined when the point misses the ring entirely', () => {
    // mock — well inside the box, away from any corner
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 103, y: 103 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBe(true);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current).toMatchObject({ pivot: { x: 50, y: 50 } });
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined for a shift+click in the rotate ring instead of arming a rotate — shift always means "toggle selection", regardless of where it lands', () => {
    // mock — same v1(0,0)/v2(100,100) ring-position setup as the first test above, but with shiftKey held
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 100, y: 110 } });

    // result
    expect(armVectorMultiSelectRotateOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current).toBeNull();
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

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 25, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
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

    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1'];
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v3'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 150, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1', 's2']);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v3']);
  });

  it('should remove the segment from the selection on shift-click when it is already selected', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1'];

    // before
    const ctx = createContext({ canvasRefs, event: pointerEvent({ shiftKey: true }), point: { x: 25, y: 0 } });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
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

    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1', 's2'];

    // before
    const ctx = createContext({ canvasRefs, point: { x: 25, y: 0 }, selectionRefs });

    // result
    expect(armVectorSegmentOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1', 's2']);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.vertexOrigins).toEqual({
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
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.vertexOrigins).toEqual({
      v1: { x: 0, y: 0 },
      v2: { x: 100, y: 0 },
    });
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
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.pendingClickAction).toEqual({
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
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.pendingClickAction).toBeNull();
  });
});

describe('ARM_RESOLVERS ordering — multi-select box vs. outline vertex point', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it("should let the multi-select box resize handle claim the pointerdown before the outline vertex resolver, when a box corner coincides with a selected vertex — a 2-vertex selection's box corners always sit exactly on those two vertices, so without this ordering the resize handle would never be reachable", () => {
    // mock — v1(0,0), v2(100,100) selected; the box's own "se" corner sits exactly at v2's position
    const nodeId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    );

    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    const ctx = createContext({ canvasRefs, point: { x: 100, y: 100 } });

    // before — walk the real resolver chain in its actual production order, exactly as handlePointerDown does
    const claimedBy = ARM_RESOLVERS.find((resolve) => resolve(ctx));

    // result
    expect(claimedBy).toBe(armVectorMultiSelectResizeOnPointerDown);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current).toMatchObject({ handle: 'se' });
  });

  it('should let the multi-select box rotate ring claim the pointerdown before the outline vertex resolver, when the ring coincides with an (unselected) vertex of the same node', () => {
    // mock — only v1(0,0)/v2(100,100) are selected, so the box spans (0,0)-(100,100) with its "se"
    // rotate ring 6-16px past (100,100); v3 sits unselected right in that ring, at (100,110) — the
    // vertex resolver still hits ANY vertex of the node regardless of selection, so this is a real
    // coincidence a user can hit, not just a selected-vertex one
    const nodeId = addVectorNode(
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 }, v3: { id: 'v3', x: 100, y: 110 } },
    );

    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    const ctx = createContext({ canvasRefs, point: { x: 100, y: 110 } });

    // before
    const claimedBy = ARM_RESOLVERS.find((resolve) => resolve(ctx));

    // result
    expect(claimedBy).toBe(armVectorMultiSelectRotateOnPointerDown);
    expect(ctx.canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current).not.toBeNull();
  });
});

describe('armVectorShapeBuilderOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should seed the shape-builder path, reset touched faces, set the cursor class, capture the pointer, and return true, when Shape Builder is active and Vector Edit Mode is on', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ activeTool: ToolName.shapeBuilder, canvasRefs, point: { x: 42, y: 24 } });

    // result
    expect(armVectorShapeBuilderOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toEqual([{ x: 42, y: 24 }]);
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current).toEqual({});
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(false);
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current).toBe(false);
    expect(ctx.setClassName).toHaveBeenCalledWith('add');
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should seed touched faces with the face under the click point, even on a plain click with no drag', () => {
    // mock — vectorNode's own module-level triangle fixture (v1/v2/v3, s1/s2/s3)
    const nodeId = addVectorNode(vectorNode.segments, vectorNode.vertices);

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — a point inside the triangle
    const ctx = createContext({ activeTool: ToolName.shapeBuilder, canvasRefs, point: { x: 50, y: 40 } });

    // result
    expect(armVectorShapeBuilderOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current[nodeId].size).toBe(1);
  });

  it('should record box mode and subtract mode from shift/alt held at pointerdown', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({
      activeTool: ToolName.shapeBuilder,
      canvasRefs,
      event: pointerEvent({ altKey: true, shiftKey: true }),
      point: { x: 42, y: 24 },
    });

    // result
    expect(armVectorShapeBuilderOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(true);
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current).toBe(true);
  });

  it('should return undefined when Shape Builder is not the active tool', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['vector-1']));

    // before
    const ctx = createContext({ activeTool: ToolName.default });

    // result
    expect(armVectorShapeBuilderOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toBeNull();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.shapeBuilder });

    // result
    expect(armVectorShapeBuilderOnPointerDown(ctx)).toBeUndefined();
    expect(ctx.canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toBeNull();
  });
});

describe('armVectorWidthPointOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should arm a new width point at the closest point on the stroke, seeded with the base half-stroke-width, with Variable Width active', () => {
    // mock — a(0,0)->b(100,0), clicked at its own midpoint
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before
    const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 50, y: 0 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toMatchObject({
      isNewPoint: true,
      nodeId,
      point: { leftOffset: 0.5, position: 0.5, rightOffset: 0.5 },
    });
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([
      { nodeId, pointId: canvasRefs.vectorWidth.vectorWidthPointDragRef.current?.point.id, side: 'left' },
      { nodeId, pointId: canvasRefs.vectorWidth.vectorWidthPointDragRef.current?.point.id, side: 'right' },
      { nodeId, pointId: canvasRefs.vectorWidth.vectorWidthPointDragRef.current?.point.id, side: 'point' },
    ]);
    expect(ctx.canvas.setPointerCapture).toHaveBeenCalledWith(1);
    // seeding a new point arms its right handle, which uses the rotated resize cursor, not the plain controller class
    expect(ctx.setClassName).toHaveBeenCalledWith(null);
    expect(canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current).toEqual({
      nodeId,
      pointId: canvasRefs.vectorWidth.vectorWidthPointDragRef.current?.point.id,
      side: 'right',
    });
  });

  it('should arm a drag on an existing width point marker instead of creating a new one, when the click lands on it, and select only the point itself', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(
      updateNode({
        changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — clicking right on the existing marker at (50, 0)
    const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 50, y: 0 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toEqual({
      armMagnitude: 6,
      armWorldPoint: { x: 50, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId,
      point: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 },
      target: 'point',
    });
    // clicking the center anchor selects only the point, leaving both diamonds unselected until grabbed directly
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([{ nodeId, pointId: 'p1', side: 'point' }]);
  });

  it('should select both handle sides of the point when either one is clicked, since they now move together', () => {
    // mock — a(0,0)->b(100,0), point at midpoint (50,0), normal (0,1) so the right handle sits at (50,-6)
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(
      updateNode({
        changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — clicking right on the right handle
    const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 50, y: -6 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toMatchObject({ target: 'right' });
    // grabbing a diamond selects both sides plus the point itself, so the anchor shows selected too
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([
      { nodeId, pointId: 'p1', side: 'left' },
      { nodeId, pointId: 'p1', side: 'right' },
      { nodeId, pointId: 'p1', side: 'point' },
    ]);
    // grabbing a resize handle uses the rotated resize cursor, not the plain controller class
    expect(ctx.setClassName).toHaveBeenCalledWith(null);
    expect(canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current).toEqual({ nodeId, pointId: 'p1', side: 'right' });
  });

  it('should seed the arm magnitude from the left offset specifically when the left handle is grabbed', () => {
    // mock — a(0,0)->b(100,0), point at midpoint (50,0), normal (0,1) so the left handle sits at (50,9)
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(
      updateNode({
        changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 9, position: 0.5, rightOffset: 6 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    // before — clicking right on the left handle
    const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 50, y: 9 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toMatchObject({ armMagnitude: 9, target: 'left' });
    expect(canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current).toEqual({ nodeId, pointId: 'p1', side: 'left' });
  });

  it('should return undefined and clear any existing selection when the click misses the stroke and every marker', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId, pointId: 'p1', side: 'left' }];

    // before — clicking empty space, well away from the stroke
    const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 500, y: 500 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBeUndefined();
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toBeNull();
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([]);
  });

  it('should consume the click and keep the selection when it lands on the visible value label, not on the stroke', () => {
    // mock — a(0,0)->b(100,0), p1 at midpoint; right handle (50,-6), label centre 28px further at (50,-34)
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(
      updateNode({
        changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId, pointId: 'p1', side: 'point' }];

    // before — clicking the label badge, which sits off the stroke
    const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 50, y: -34 } });

    // result — consumed, selection untouched, no drag armed
    expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toBeNull();
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([{ nodeId, pointId: 'p1', side: 'point' }]);
  });

  it('should return undefined when the only editing node is a branching network', () => {
    // mock — b is a 3-way branch, ineligible for a width profile
    const nodeId = addVectorNode(
      {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 200, y: 0 }, d: { id: 'd', x: 100, y: 100 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.variableWidth, point: { x: 50, y: 0 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Variable Width is not the active tool', () => {
    // mock
    const nodeId = addVectorNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    const ctx = createContext({ activeTool: ToolName.default, point: { x: 50, y: 0 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBeUndefined();
  });

  it('should return undefined when Vector Edit Mode is not active', () => {
    // before
    const ctx = createContext({ activeTool: ToolName.variableWidth, point: { x: 50, y: 0 } });

    // result
    expect(armVectorWidthPointOnPointerDown(ctx)).toBeUndefined();
  });

  describe('multi-select', () => {
    const addTwoWidthPointNode = (): string => {
      const nodeId = addVectorNode(
        { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
        { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
      );

      store.dispatch(
        updateNode({
          changes: {
            widthProfile: {
              points: {
                p1: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 },
                p2: { id: 'p2', leftOffset: 8, position: 0.7, rightOffset: 8 },
              },
            },
          },
          id: nodeId,
        }),
      );
      store.dispatch(setVectorEditingNodeIds([nodeId]));

      return nodeId;
    };

    it('should shift+click-toggle a regulator into the selection, as just its "point" entry, without arming any drag', () => {
      // mock — clicking right on p1's left handle at (20, 6)
      const nodeId = addTwoWidthPointNode();
      const canvasRefs = createCanvasRefs();
      const ctx = createContext({
        activeTool: ToolName.variableWidth,
        canvasRefs,
        event: pointerEvent({ shiftKey: true }),
        point: { x: 20, y: 6 },
      });

      // result
      expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
      expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([{ nodeId, pointId: 'p1', side: 'point' }]);
      expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toBeNull();
    });

    it('should shift+click-toggle an already-selected regulator back out of the selection', () => {
      // mock
      const nodeId = addTwoWidthPointNode();
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [
        { nodeId, pointId: 'p1', side: 'point' },
        { nodeId, pointId: 'p2', side: 'point' },
      ];

      // before — shift-clicking p1's left handle again
      const ctx = createContext({
        activeTool: ToolName.variableWidth,
        canvasRefs,
        event: pointerEvent({ shiftKey: true }),
        point: { x: 20, y: 6 },
      });

      // result
      expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
      expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([{ nodeId, pointId: 'p2', side: 'point' }]);
      expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toBeNull();
    });

    it('should arm a group drag across every multi-selected regulator when grabbing a diamond that is already part of the selection', () => {
      // mock — p1 and p2 were both shift-selected beforehand (only "point" entries)
      const nodeId = addTwoWidthPointNode();
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [
        { nodeId, pointId: 'p1', side: 'point' },
        { nodeId, pointId: 'p2', side: 'point' },
      ];

      // before — plain click (no shift) right on p1's left handle at (20, 6)
      const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 20, y: 6 } });

      // result
      expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
      expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toMatchObject({
        groupTargets: [{ nodeId, point: { id: 'p2', leftOffset: 8, position: 0.7, rightOffset: 8 } }],
        nodeId,
        point: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 },
        target: 'left',
      });
      expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([
        { nodeId, pointId: 'p1', side: 'left' },
        { nodeId, pointId: 'p1', side: 'right' },
        { nodeId, pointId: 'p1', side: 'point' },
        { nodeId, pointId: 'p2', side: 'left' },
        { nodeId, pointId: 'p2', side: 'right' },
        { nodeId, pointId: 'p2', side: 'point' },
      ]);
      // the actively-grabbed side (p1's left handle) is remembered, even though the group also includes p2
      expect(canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current).toEqual({ nodeId, pointId: 'p1', side: 'left' });
    });

    it('should preserve the existing multi-selection, and arm no group targets, when re-grabbing the center anchor of an already-selected regulator', () => {
      // mock
      const nodeId = addTwoWidthPointNode();
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [
        { nodeId, pointId: 'p1', side: 'point' },
        { nodeId, pointId: 'p2', side: 'point' },
      ];

      // before — plain click right on p1's own anchor at (20, 0)
      const ctx = createContext({ activeTool: ToolName.variableWidth, canvasRefs, point: { x: 20, y: 0 } });

      // result
      expect(armVectorWidthPointOnPointerDown(ctx)).toBe(true);
      expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toMatchObject({ groupTargets: [], target: 'point' });
      expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([
        { nodeId, pointId: 'p1', side: 'point' },
        { nodeId, pointId: 'p2', side: 'point' },
      ]);
    });
  });
});

describe('armGroupChildToggleOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should select the individual child on a plain Ctrl+click, bypassing the group, and arm a drag for it', () => {
    // mock
    const a = addRectangleNode(500000, 500000, 20);
    const b = addRectangleNode(500100, 500000, 20);

    store.dispatch(setSelection([a.id, b.id]));
    store.dispatch(groupNodes());

    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const ctx = createContext({
      canvasRefs,
      currentSelection: selectSelectedIds(store.getState()),
      dispatch: store.dispatch,
      event: pointerEvent({ ctrlKey: true }),
      point: { x: 500010, y: 500010 },
      selectionRefs,
    });

    // action
    const resolved = armGroupChildToggleOnPointerDown(ctx);

    // result
    expect(resolved).toBe(true);
    expect(selectSelectedIds(store.getState())).toEqual([a.id]);
    expect(selectionRefs.dragStateRef.current?.nodeOrigins).toEqual({ [a.id]: { x: 500000, y: 500000 } });
  });

  it('should select the individual child on a plain Cmd/⌘+click too, since macOS treats a physical Ctrl+click as a secondary click', () => {
    // mock
    const a = addRectangleNode(500000, 500000, 20);
    const b = addRectangleNode(500100, 500000, 20);

    store.dispatch(setSelection([a.id, b.id]));
    store.dispatch(groupNodes());

    const ctx = createContext({
      currentSelection: selectSelectedIds(store.getState()),
      dispatch: store.dispatch,
      event: pointerEvent({ metaKey: true }),
      point: { x: 500010, y: 500010 },
    });

    // action
    const resolved = armGroupChildToggleOnPointerDown(ctx);

    // result
    expect(resolved).toBe(true);
    expect(selectSelectedIds(store.getState())).toEqual([a.id]);
  });

  it('should toggle the individual child in and out of the selection on Ctrl+Shift+click', () => {
    // mock
    const a = addRectangleNode(500000, 500000, 20);
    const b = addRectangleNode(500100, 500000, 20);

    store.dispatch(setSelection([a.id, b.id]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([]));

    // before — first click adds the child
    armGroupChildToggleOnPointerDown(
      createContext({
        currentSelection: selectSelectedIds(store.getState()),
        dispatch: store.dispatch,
        event: pointerEvent({ ctrlKey: true, shiftKey: true }),
        point: { x: 500010, y: 500010 },
      }),
    );

    // result
    expect(selectSelectedIds(store.getState())).toEqual([a.id]);

    // action — second click on the same child removes it again
    const resolved = armGroupChildToggleOnPointerDown(
      createContext({
        currentSelection: selectSelectedIds(store.getState()),
        dispatch: store.dispatch,
        event: pointerEvent({ ctrlKey: true, shiftKey: true }),
        point: { x: 500010, y: 500010 },
      }),
    );

    // result
    expect(resolved).toBe(true);
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should do nothing when Ctrl is not held', () => {
    // mock
    const a = addRectangleNode(500000, 500000, 20);
    const b = addRectangleNode(500100, 500000, 20);

    store.dispatch(setSelection([a.id, b.id]));
    store.dispatch(groupNodes());

    const ctx = createContext({ event: pointerEvent(), point: { x: 500010, y: 500010 } });

    // action & result
    expect(armGroupChildToggleOnPointerDown(ctx)).toBeUndefined();
  });

  it('should do nothing when Ctrl+click misses every node', () => {
    // mock
    const ctx = createContext({ event: pointerEvent({ ctrlKey: true }), point: { x: 9000, y: 9000 } });

    // action & result
    expect(armGroupChildToggleOnPointerDown(ctx)).toBeUndefined();
  });
});
