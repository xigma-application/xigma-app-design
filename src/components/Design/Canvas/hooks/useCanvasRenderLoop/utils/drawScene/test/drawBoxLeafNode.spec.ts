// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawBoxLeafNode } from '../drawBoxLeafNode';

const drawRectMock = vi.fn();
const drawThickOutlineMock = vi.fn();
const drawVectorFillGroupMock = vi.fn();
const getBoxFillPolygonMock = vi.fn();
const resolvePatternSourceTileMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));
vi.mock('../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup', () => ({
  drawVectorFillGroup: (...args: unknown[]): void => drawVectorFillGroupMock(...args),
}));
vi.mock('../getBoxFillPolygon', () => ({ getBoxFillPolygon: (...args: unknown[]): unknown => getBoxFillPolygonMock(...args) }));
vi.mock('../resolvePatternSourceTile', () => ({
  resolvePatternSourceTile: (...args: unknown[]): unknown => resolvePatternSourceTileMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as TDrawSceneContext['imageContext'];
const context: TDrawSceneContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT };
const nodesById = {};
const pathOutlineStyles = new Map();
const refs = createCanvasRefs();
const editingPathId = null;

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
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
});

const section = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  childIds: [],
  fill: '#fff',
  height: 20,
  id: 's1',
  name: 'Section',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawBoxLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBoxFillPolygonMock.mockReturnValue([{ x: 0, y: 0 }]);
    resolvePatternSourceTileMock.mockReturnValue(null);
  });

  it('should draw the fill paint stack through the shared vector fill group, scaling opacity into each paint', () => {
    // mock
    const node = rect({ fills: [{ color: '#fff', opacity: 50, type: 'solid' }] });

    // action
    drawBoxLeafNode(context, node, 0.5, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(getBoxFillPolygonMock).toHaveBeenCalledWith(node);
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [{ color: '#fff', opacity: 25, type: 'solid' }],
      [null],
    );
    expect(drawRectMock).not.toHaveBeenCalled();
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should paint fills in reverse-list order, so the first fill in the list ends up on top', () => {
    // mock
    const node = rect({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result — drawn last-to-first, so '#111111' (list position 1) paints last, on top
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [
        { color: '#222222', opacity: 100, type: 'solid' },
        { color: '#111111', opacity: 100, type: 'solid' },
      ],
      [null, null],
    );
  });

  it('should resolve a pattern source tile per pattern paint with a sourceNodeId, and release it after drawing', () => {
    // mock
    const resolvedTile = { release: vi.fn(), tile: { height: 10, texture: {} as WebGLTexture, width: 10, x: 0, y: 0 } };

    resolvePatternSourceTileMock.mockReturnValue(resolvedTile);

    const pattern: TRectangleNode['fills'][number] = {
      alignmentIndex: 0,
      direction: 'horizontal',
      opacity: 100,
      scale: 100,
      sourceNodeId: 'source-1',
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    };
    const node = rect({ fills: [pattern] });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(resolvePatternSourceTileMock).toHaveBeenCalledWith(context, 'source-1', nodesById, pathOutlineStyles, refs, editingPathId, 0);
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(context, null, null, [[{ x: 0, y: 0 }]], [pattern], [resolvedTile.tile]);
    expect(resolvedTile.release).toHaveBeenCalled();
  });

  it('should not resolve a pattern source tile for a pattern paint with no sourceNodeId', () => {
    // mock
    const pattern: TRectangleNode['fills'][number] = {
      alignmentIndex: 0,
      direction: 'horizontal',
      opacity: 100,
      scale: 100,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    };
    const node = rect({ fills: [pattern] });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(resolvePatternSourceTileMock).not.toHaveBeenCalled();
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(context, null, null, [[{ x: 0, y: 0 }]], [pattern], [null]);
  });

  it('should draw a section fill via the plain-color drawRect path, since sections still use a single hex fill', () => {
    // mock
    const node = section();

    // action
    drawBoxLeafNode(context, node, 0.5, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(gl, program, buffer, { ...node, fillAlpha: 0.5 }, 200, 150, IDENTITY_VIEWPORT, 0);
    expect(drawVectorFillGroupMock).not.toHaveBeenCalled();
  });

  it('should draw the stroke outline, forwarding the stroke alignment, when both strokeColor and strokeWidth are set', () => {
    // mock
    const node = rect({ strokeAlign: StrokeAlign.inside, strokeColor: '#000', strokeWidth: 2 });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node,
      '#000',
      2,
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
      StrokeAlign.inside,
      1,
    );
  });

  it('should skip the stroke outline when strokeWidth is missing, even with a strokeColor set', () => {
    // mock
    const node = rect({ strokeColor: '#000' });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });
});
