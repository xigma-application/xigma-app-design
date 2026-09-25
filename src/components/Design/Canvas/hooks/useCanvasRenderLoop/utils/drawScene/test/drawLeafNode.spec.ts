// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { NodeType, PathType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TImageRenderContext } from '../../../types';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawLeafNode } from '../drawLeafNode';
import { getBoxFillPolygon } from '../getBoxFillPolygon';
import { getScaledFillPaints } from '../getScaledFillPaints';

const drawBooleanLeafNodeMock = vi.fn();
const drawEllipseNodeMock = vi.fn();
const drawEllipseArcMock = vi.fn();
const drawEllipseMock = vi.fn();
const drawThickEllipseOutlineMock = vi.fn();
const drawImageMock = vi.fn();
const drawLineLeafNodeMock = vi.fn();
const drawMsdfTextMock = vi.fn();
const drawPathOutlineMock = vi.fn();
const drawPolygonMock = vi.fn();
const drawRectMock = vi.fn();
const drawStarMock = vi.fn();
const drawThickOutlineMock = vi.fn();
const drawVectorFillGroupMock = vi.fn();
const drawVectorNodeOrTextPathGuideMock = vi.fn();
const getOrLoadTextureMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();

vi.mock('../drawBooleanLeafNode/drawBooleanLeafNode', () => ({
  drawBooleanLeafNode: (...args: unknown[]): void => drawBooleanLeafNodeMock(...args),
}));
vi.mock('../drawEllipseLeafNode/drawEllipseNode', () => ({ drawEllipseNode: (...args: unknown[]): void => drawEllipseNodeMock(...args) }));
vi.mock('utils/canvas/drawEllipseArc', () => ({ drawEllipseArc: (...args: unknown[]): void => drawEllipseArcMock(...args) }));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/shapes/drawThickEllipseOutline', () => ({
  drawThickEllipseOutline: (...args: unknown[]): void => drawThickEllipseOutlineMock(...args),
}));
vi.mock('utils/canvas/drawImage', () => ({ drawImage: (...args: unknown[]): void => drawImageMock(...args) }));
vi.mock('../drawLineLeafNode', () => ({ drawLineLeafNode: (...args: unknown[]): void => drawLineLeafNodeMock(...args) }));
vi.mock('utils/canvas/text/drawMsdfText', () => ({ drawMsdfText: (...args: unknown[]): void => drawMsdfTextMock(...args) }));
vi.mock('../drawPathOutline', () => ({ drawPathOutline: (...args: unknown[]): void => drawPathOutlineMock(...args) }));
vi.mock('utils/canvas/drawPolygon/drawPolygon', () => ({ drawPolygon: (...args: unknown[]): void => drawPolygonMock(...args) }));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawStar/drawStar', () => ({ drawStar: (...args: unknown[]): void => drawStarMock(...args) }));
vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));
vi.mock('../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup', () => ({
  drawVectorFillGroup: (...args: unknown[]): void => drawVectorFillGroupMock(...args),
}));
vi.mock('../drawVectorNodeOrTextPathGuide/drawVectorNodeOrTextPathGuide', () => ({
  drawVectorNodeOrTextPathGuide: (...args: unknown[]): void => drawVectorNodeOrTextPathGuideMock(...args),
}));
vi.mock('utils/canvas/getOrLoadTexture', () => ({ getOrLoadTexture: (...args: unknown[]): unknown => getOrLoadTextureMock(...args) }));
vi.mock('utils/canvas/text/getMsdfAtlasTexture', () => ({
  getMsdfAtlasTexture: (...args: unknown[]): unknown => getMsdfAtlasTextureMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as unknown as TImageRenderContext;

const context: TDrawSceneContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT };

const DEFAULT_BOX_ROTATION = { center: { x: 10, y: 10 }, degrees: 0, localBounds: { height: 20, width: 20, x: 0, y: 0 } };

const rect = (overrides: Record<string, unknown> = {}): TSceneNode =>
  ({
    fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
    height: 20,
    id: 'r1',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('drawLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw a rectangle at full opacity when it is not being dragged over an auto-layout frame', () => {
    // mock
    const node = rect();
    const refs = createCanvasRefs();

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      expect.any(Object),
      null,
      [getBoxFillPolygon(node as TRectangleNode)],
      getScaledFillPaints((node as TRectangleNode).fills, 1),
      [null],
      DEFAULT_BOX_ROTATION,
      'evenOdd',
    );
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should dim a rectangle to 0.5 opacity while it is dragged over an active auto-layout drop target', () => {
    // mock
    const node = rect({ strokeColor: '#000', strokeWidth: 2 });
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['r1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result — the fill is dimmed, but the stroke outline still draws at full opacity (not covered by this scope)
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      expect.any(Object),
      null,
      [getBoxFillPolygon(node as TRectangleNode)],
      getScaledFillPaints((node as TRectangleNode).fills, 0.5),
      [null],
      DEFAULT_BOX_ROTATION,
      'evenOdd',
    );
    expect(drawThickOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, '#000', 2, 200, 150, IDENTITY_VIEWPORT, 0, undefined, 0.5);
  });

  it('should draw a rectangle at its live reorder-preview position instead of its real stored x/y', () => {
    // mock
    const node = rect({ x: 5, y: 15 });
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { r1: { x: 40, y: 60 } } } } },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    const previewNode = { ...node, x: 40, y: 60 } as TRectangleNode;

    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      expect.any(Object),
      null,
      [getBoxFillPolygon(previewNode)],
      getScaledFillPaints(previewNode.fills, 1),
      [null],
      { center: { x: 50, y: 70 }, degrees: 0, localBounds: { height: 20, width: 20, x: 40, y: 60 } },
      'evenOdd',
    );
  });

  it('should not dim a rectangle that is dragged but not currently over an auto-layout frame', () => {
    // mock
    const node = rect();
    const refs = createCanvasRefs({ transform: { draggedNodeIdsRef: { current: new Set(['r1']) } } });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      expect.any(Object),
      null,
      [getBoxFillPolygon(node as TRectangleNode)],
      getScaledFillPaints((node as TRectangleNode).fills, 1),
      [null],
      DEFAULT_BOX_ROTATION,
      'evenOdd',
    );
  });

  it('should not dim some other node also over the drop target frame that is not itself being dragged', () => {
    // mock
    const node = rect();
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['someone-else']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      expect.any(Object),
      null,
      [getBoxFillPolygon(node as TRectangleNode)],
      getScaledFillPaints((node as TRectangleNode).fills, 1),
      [null],
      DEFAULT_BOX_ROTATION,
      'evenOdd',
    );
  });

  it("should dim a child rectangle by its ancestor frame's opacity, compounded with its own", () => {
    // mock
    const parentFrame = {
      childIds: ['r1'],
      clipContent: false,
      fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
      height: 100,
      id: 'f1',
      name: 'Frame',
      opacity: 0.5,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    } as TSceneNode;
    const node = rect({ opacity: 0.5, parentId: 'f1' });
    const nodesById = { f1: parentFrame, r1: node };

    // action
    drawLeafNode(context, node, new Map(), createCanvasRefs(), nodesById);

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      expect.any(Object),
      null,
      [getBoxFillPolygon(node as TRectangleNode)],
      getScaledFillPaints((node as TRectangleNode).fills, 0.25),
      [null],
      DEFAULT_BOX_ROTATION,
      'evenOdd',
    );
  });

  it('should draw an ellipse with the arc defaults and threaded opacity, skipping the stroke when unset', () => {
    // mock
    const node: TSceneNode = {
      fill: '#fff',
      height: 20,
      id: 'e1',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 20,
      x: 0,
      y: 0,
    };
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['e1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawEllipseNodeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...node, arcEndAngle: ELLIPSE_DEFAULT_ARC_ANGLE, arcStartAngle: ELLIPSE_DEFAULT_ARC_ANGLE, fillAlpha: 0.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw an ellipse’s stroke outline when strokeColor and strokeWidth are both set', () => {
    // mock
    const node: TSceneNode = {
      fill: '#fff',
      flipX: true,
      flipY: true,
      height: 20,
      id: 'e2',
      name: 'Ellipse',
      parentId: null,
      rotation: 15,
      strokeColor: '#111',
      strokeWidth: 3,
      type: NodeType.ellipse,
      width: 20,
      x: 0,
      y: 0,
    };
    const refs = createCanvasRefs();

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawThickEllipseOutlineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node,
      '#111',
      3,
      200,
      150,
      IDENTITY_VIEWPORT,
      15,
      undefined,
    );
  });

  it('should draw a polygon with the threaded opacity', () => {
    // mock
    const node: TSceneNode = {
      fill: '#fff',
      flipX: false,
      flipY: false,
      height: 20,
      id: 'p1',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 5,
      type: NodeType.polygon,
      width: 20,
      x: 0,
      y: 0,
    };
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['p1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawPolygonMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...node, fillAlpha: 0.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
  });

  it('should draw a star with the threaded opacity', () => {
    // mock
    const node: TSceneNode = {
      fill: '#fff',
      flipX: false,
      flipY: false,
      height: 20,
      id: 's1',
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.5,
      rotation: 0,
      type: NodeType.star,
      width: 20,
      x: 0,
      y: 0,
    };
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['s1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawStarMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...node, fillAlpha: 0.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );
  });

  it('should draw media through the image pipeline', () => {
    // mock
    const node: TSceneNode = {
      flipX: false,
      flipY: false,
      height: 20,
      id: 'm1',
      name: 'Media',
      parentId: null,
      rotation: 0,
      src: 'blob:img',
      type: NodeType.media,
      width: 20,
      x: 0,
      y: 0,
    };
    const texture = {} as WebGLTexture;
    getOrLoadTextureMock.mockReturnValue(texture);

    // action
    drawLeafNode(context, node, new Map(), createCanvasRefs(), {});

    // result
    expect(drawImageMock).toHaveBeenCalledWith(gl, undefined, undefined, texture, node, 200, 150, IDENTITY_VIEWPORT, false, false, 0);
  });

  it('should draw a line through its paints with the threaded opacity', () => {
    // mock
    const node: TSceneNode = {
      height: 0,
      id: 'l1',
      name: 'Line',
      parentId: null,
      rotation: 0,
      strokes: [{ color: '#222', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      width: 10,
      x: 0,
      y: 0,
    };
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 }, siblingPositions: {} },
        },
        draggedNodeIdsRef: { current: new Set(['l1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawLineLeafNodeMock).toHaveBeenCalledWith(context, node, 0.5, {}, expect.any(Map), refs, undefined, 0);
  });

  it('should draw a path outline using its resolved style', () => {
    // mock
    const node: TSceneNode = {
      height: 20,
      id: 'path1',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 20,
      x: 0,
      y: 0,
    };
    const pathOutlineStyles = new Map([['path1', { color: '#000' } as never]]);

    // action
    drawLeafNode(context, node, pathOutlineStyles, createCanvasRefs(), {});

    // result
    expect(drawPathOutlineMock).toHaveBeenCalledWith(context, node, { color: '#000' });
  });

  it('should draw a vector node through the vector/text-path guide pipeline', () => {
    // mock
    const node: TSceneNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'v1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };
    const nodesById = { v1: node };

    // action
    drawLeafNode(context, node, new Map(), createCanvasRefs(), nodesById, 'editing-id');

    // result
    expect(drawVectorNodeOrTextPathGuideMock).toHaveBeenCalledTimes(1);
    expect(drawVectorNodeOrTextPathGuideMock.mock.calls[0]).toContain(node);
    expect(drawVectorNodeOrTextPathGuideMock.mock.calls[0]).toContain('editing-id');
  });

  it('should draw nothing for a group node — it is painted by its own dedicated renderer', () => {
    // mock
    const node: TSceneNode = {
      childIds: [],
      height: 20,
      id: 'g1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 20,
      x: 0,
      y: 0,
    };

    // action / result
    expect(() => drawLeafNode(context, node, new Map(), createCanvasRefs(), {})).not.toThrow();
  });

  it('should draw nothing for a slice — only its dashed outline is drawn, by its own pass', () => {
    // mock
    const node: TSceneNode = {
      height: 20,
      id: 's1',
      name: 'Slice',
      parentId: null,
      rotation: 0,
      type: NodeType.slice,
      width: 20,
      x: 0,
      y: 0,
    };

    // before
    drawLeafNode(context, node, new Map(), createCanvasRefs(), {});

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw a boolean through its own boolean renderer with the threaded opacity', () => {
    // mock
    const node = {
      booleanOperation: 'union',
      childIds: [],
      fills: [],
      height: 20,
      id: 'b1',
      name: 'Union',
      parentId: null,
      rotation: 0,
      type: NodeType.boolean,
      width: 20,
      x: 0,
      y: 0,
    } as unknown as TSceneNode;

    // before
    drawLeafNode(context, node, new Map(), createCanvasRefs(), {});

    // result
    expect(drawBooleanLeafNodeMock).toHaveBeenCalledTimes(1);
    expect(drawBooleanLeafNodeMock.mock.calls[0][1]).toBe(node);
    expect(drawBooleanLeafNodeMock.mock.calls[0][2]).toBe(1);
  });

  it('should draw text through the MSDF pipeline, resolving its bound path node when present', () => {
    // mock
    const pathNode: TSceneNode = {
      height: 20,
      id: 'path1',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 20,
      x: 0,
      y: 0,
    };
    const node: TSceneNode = {
      content: 'Hi',
      fill: '#000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 20,
      id: 't1',
      name: 'Text',
      parentId: null,
      pathId: 'path1',
      rotation: 0,
      type: NodeType.text,
      width: 20,
      x: 0,
      y: 0,
    };
    const texture = {} as WebGLTexture;
    getMsdfAtlasTextureMock.mockReturnValue(texture);

    // action
    drawLeafNode(context, node, new Map(), createCanvasRefs(), { path1: pathNode });

    // result
    expect(drawMsdfTextMock.mock.calls[0]).toContain(pathNode);
  });

  it('should not resolve a path node for text with no pathId', () => {
    // mock
    const node: TSceneNode = {
      content: 'Hi',
      fill: '#000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 20,
      id: 't2',
      name: 'Text',
      parentId: null,
      pathId: null,
      rotation: 0,
      type: NodeType.text,
      width: 20,
      x: 0,
      y: 0,
    };

    // action
    drawLeafNode(context, node, new Map(), createCanvasRefs(), {});

    // result
    expect(drawMsdfTextMock.mock.calls[0]).toContain(undefined);
  });
});
