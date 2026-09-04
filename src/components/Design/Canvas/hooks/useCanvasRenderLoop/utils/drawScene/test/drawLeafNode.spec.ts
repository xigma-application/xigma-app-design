// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType, PathType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TImageRenderContext } from '../../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawLeafNode } from '../drawLeafNode';

const drawEllipseNodeMock = vi.fn();
const drawEllipseArcMock = vi.fn();
const drawEllipseMock = vi.fn();
const drawThickEllipseOutlineMock = vi.fn();
const drawImageMock = vi.fn();
const drawLineMock = vi.fn();
const drawLineEndpointArrowheadsMock = vi.fn();
const drawMsdfTextMock = vi.fn();
const drawPathOutlineMock = vi.fn();
const drawPolygonMock = vi.fn();
const drawRectMock = vi.fn();
const drawStarMock = vi.fn();
const drawThickOutlineMock = vi.fn();
const drawVectorNodeOrTextPathGuideMock = vi.fn();
const getOrLoadTextureMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();

vi.mock('utils/canvas/drawEllipseNode', () => ({ drawEllipseNode: (...args: unknown[]): void => drawEllipseNodeMock(...args) }));
vi.mock('utils/canvas/drawEllipseArc', () => ({ drawEllipseArc: (...args: unknown[]): void => drawEllipseArcMock(...args) }));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/shapes/drawThickEllipseOutline', () => ({
  drawThickEllipseOutline: (...args: unknown[]): void => drawThickEllipseOutlineMock(...args),
}));
vi.mock('utils/canvas/drawImage', () => ({ drawImage: (...args: unknown[]): void => drawImageMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('../drawLineEndpointArrowheads', () => ({
  drawLineEndpointArrowheads: (...args: unknown[]): void => drawLineEndpointArrowheadsMock(...args),
}));
vi.mock('utils/canvas/text/drawMsdfText', () => ({ drawMsdfText: (...args: unknown[]): void => drawMsdfTextMock(...args) }));
vi.mock('../drawPathOutline', () => ({ drawPathOutline: (...args: unknown[]): void => drawPathOutlineMock(...args) }));
vi.mock('utils/canvas/drawPolygon/drawPolygon', () => ({ drawPolygon: (...args: unknown[]): void => drawPolygonMock(...args) }));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawStar/drawStar', () => ({ drawStar: (...args: unknown[]): void => drawStarMock(...args) }));
vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));
vi.mock('../drawVectorNodeOrTextPathGuide', () => ({
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

const rect = (overrides: Record<string, unknown> = {}): TSceneNode =>
  ({
    fill: '#fff',
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
    expect(drawRectMock).toHaveBeenCalledWith(gl, program, buffer, { ...node, fillAlpha: 1 }, 200, 150, IDENTITY_VIEWPORT, 0);
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should dim a rectangle to 0.5 opacity while it is dragged over an active auto-layout drop target', () => {
    // mock
    const node = rect({ strokeColor: '#000', strokeWidth: 2 });
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 } } },
        draggedNodeIdsRef: { current: new Set(['r1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result — the fill is dimmed, but the stroke outline still draws at full opacity (not covered by this scope)
    expect(drawRectMock).toHaveBeenCalledWith(gl, program, buffer, { ...node, fillAlpha: 0.5 }, 200, 150, IDENTITY_VIEWPORT, 0);
    expect(drawThickOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, '#000', 2, 200, 150, IDENTITY_VIEWPORT, 0);
  });

  it('should not dim a rectangle that is dragged but not currently over an auto-layout frame', () => {
    // mock
    const node = rect();
    const refs = createCanvasRefs({ transform: { draggedNodeIdsRef: { current: new Set(['r1']) } } });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawRectMock).toHaveBeenCalledWith(gl, program, buffer, { ...node, fillAlpha: 1 }, 200, 150, IDENTITY_VIEWPORT, 0);
  });

  it('should not dim some other node also over the drop target frame that is not itself being dragged', () => {
    // mock
    const node = rect();
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 } } },
        draggedNodeIdsRef: { current: new Set(['someone-else']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawRectMock).toHaveBeenCalledWith(gl, program, buffer, { ...node, fillAlpha: 1 }, 200, 150, IDENTITY_VIEWPORT, 0);
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
        autoLayoutDropTargetRef: { current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 } } },
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
    expect(drawThickEllipseOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, '#111', 3, 200, 150, IDENTITY_VIEWPORT, 15);
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
        autoLayoutDropTargetRef: { current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 } } },
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
        autoLayoutDropTargetRef: { current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 } } },
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

  it('should draw a line and its endpoint arrowheads with the threaded opacity, defaulting the stroke width', () => {
    // mock
    const node: TSceneNode = {
      id: 'l1',
      name: 'Line',
      parentId: null,
      stroke: '#222',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 0,
    };
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: { current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 20, x: 0, y: 0 } } },
        draggedNodeIdsRef: { current: new Set(['l1']) },
      },
    });

    // action
    drawLeafNode(context, node, new Map(), refs, {});

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node,
      '#222',
      LINE_RENDER_STROKE_WIDTH,
      200,
      150,
      IDENTITY_VIEWPORT,
      0.5,
    );
    expect(drawLineEndpointArrowheadsMock).toHaveBeenCalledWith(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);
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
    expect(drawPathOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, { color: '#000' }, 200, 150, IDENTITY_VIEWPORT);
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
