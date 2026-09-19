// types
import { BlendMode, NodeType, StrokeAlign, StrokeJoin } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawBoxLeafNode } from '../drawBoxLeafNode';

const drawRectMock = vi.fn();
const drawThickOutlineMock = vi.fn();
const drawVectorFillGroupMock = vi.fn();
const getBoxFillPolygonMock = vi.fn();
const getBoxStrokePolygonsMock = vi.fn();
const resolvePatternSourceTileMock = vi.fn();
const resolveFrozenPatternSourceTileMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));
vi.mock('../../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup', () => ({
  drawVectorFillGroup: (...args: unknown[]): void => drawVectorFillGroupMock(...args),
}));
vi.mock('../../getBoxStrokePolygons', () => ({ getBoxStrokePolygons: (...args: unknown[]): unknown => getBoxStrokePolygonsMock(...args) }));
vi.mock('../../getBoxFillPolygon', () => ({ getBoxFillPolygon: (...args: unknown[]): unknown => getBoxFillPolygonMock(...args) }));
vi.mock('../../resolvePatternSourceTile', () => ({
  resolvePatternSourceTile: (...args: unknown[]): unknown => resolvePatternSourceTileMock(...args),
}));
vi.mock('../../resolveFrozenPatternSourceTile', () => ({
  resolveFrozenPatternSourceTile: (...args: unknown[]): unknown => resolveFrozenPatternSourceTileMock(...args),
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

const DEFAULT_BOX_ROTATION = { center: { x: 10, y: 10 }, degrees: 0, localBounds: { height: 20, width: 20, x: 0, y: 0 } };

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
    getBoxStrokePolygonsMock.mockReturnValue([[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]]);
    resolvePatternSourceTileMock.mockReturnValue(null);
    resolveFrozenPatternSourceTileMock.mockReturnValue(null);
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
      DEFAULT_BOX_ROTATION,
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

    // result — drawn last-to-first, so '#111111' (list position 1) paints last, on top; each fill
    // gets its own drawVectorFillGroup call, not one call for the whole stack, so a fill's own blend
    // mode only isolates that one fill against what's already drawn below it
    expect(drawVectorFillGroupMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillGroupMock).toHaveBeenNthCalledWith(
      1,
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [{ color: '#222222', opacity: 100, type: 'solid' }],
      [null],
      DEFAULT_BOX_ROTATION,
    );
    expect(drawVectorFillGroupMock).toHaveBeenNthCalledWith(
      2,
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [{ color: '#111111', opacity: 100, type: 'solid' }],
      [null],
      DEFAULT_BOX_ROTATION,
    );
  });

  it("should pass a single fill's own blend mode through only that fill's own drawVectorFillGroup call, not the other fills in the stack", () => {
    // mock — two image fills, only the top one carries a non-default blend mode
    const bottomFill: TRectangleNode['fills'][number] = {
      opacity: 100,
      ref: 'asset-bottom',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const topFill: TRectangleNode['fills'][number] = {
      blendMode: BlendMode.multiply,
      opacity: 100,
      ref: 'asset-top',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const node = rect({ fills: [topFill, bottomFill] });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result — the bottom fill's own call never sees the top fill's blend mode, and vice versa
    expect(drawVectorFillGroupMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillGroupMock).toHaveBeenNthCalledWith(
      1,
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [bottomFill],
      [null],
      DEFAULT_BOX_ROTATION,
    );
    expect(drawVectorFillGroupMock).toHaveBeenNthCalledWith(
      2,
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [topFill],
      [null],
      DEFAULT_BOX_ROTATION,
    );
  });

  it('should resolve a pattern source tile per pattern paint with a sourceNodeId, and release it after drawing', () => {
    // mock
    const resolvedTile = { release: vi.fn(), tile: { height: 10, texture: {} as WebGLTexture, width: 10, x: 0, y: 0 } };

    resolvePatternSourceTileMock.mockReturnValue(resolvedTile);

    const pattern: TRectangleNode['fills'][number] = {
      alignmentIndex: 0,
      direction: 'horizontal',
      offsetX: 0,
      offsetY: 0,
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
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [pattern],
      [resolvedTile.tile],
      DEFAULT_BOX_ROTATION,
    );
    expect(resolvedTile.release).toHaveBeenCalled();
  });

  it('should fall back to a frozen source snapshot when sourceNodeId is gone but a frozen snapshot remains', () => {
    // mock
    const resolvedTile = { release: vi.fn(), tile: { height: 10, texture: {} as WebGLTexture, width: 10, x: 0, y: 0 } };

    resolveFrozenPatternSourceTileMock.mockReturnValue(resolvedTile);

    const frozenSourceSnapshot = [rect({ id: 'source-1' })];
    const pattern: TRectangleNode['fills'][number] = {
      alignmentIndex: 0,
      direction: 'horizontal',
      frozenSourceSnapshot,
      offsetX: 0,
      offsetY: 0,
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
    expect(resolveFrozenPatternSourceTileMock).toHaveBeenCalledWith(
      context,
      frozenSourceSnapshot,
      pathOutlineStyles,
      refs,
      editingPathId,
      0,
    );
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [pattern],
      [resolvedTile.tile],
      DEFAULT_BOX_ROTATION,
    );
    expect(resolvedTile.release).toHaveBeenCalled();
  });

  it('should prefer a live sourceNodeId over a stale frozen snapshot when both are somehow present', () => {
    // mock
    const frozenSourceSnapshot = [rect({ id: 'old-source' })];
    const pattern: TRectangleNode['fills'][number] = {
      alignmentIndex: 0,
      direction: 'horizontal',
      frozenSourceSnapshot,
      offsetX: 0,
      offsetY: 0,
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
    expect(resolveFrozenPatternSourceTileMock).not.toHaveBeenCalled();
  });

  it('should not resolve a pattern source tile for a pattern paint with no sourceNodeId', () => {
    // mock
    const pattern: TRectangleNode['fills'][number] = {
      alignmentIndex: 0,
      direction: 'horizontal',
      offsetX: 0,
      offsetY: 0,
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
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(context, null, null, [[{ x: 0, y: 0 }]], [pattern], [null], DEFAULT_BOX_ROTATION);
  });

  it('should pass the node’s own rotation, center, and unrotated local bounds through as boxRotation, so a rotated pattern fill can stay attached to the shape', () => {
    // mock — a non-square, non-origin, rotated node: center and localBounds must reflect ITS
    // own x/y/width/height, not the shared square fixture's defaults
    const node = rect({ height: 40, rotation: 30, width: 100, x: 10, y: 20 });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      null,
      [[{ x: 0, y: 0 }]],
      [{ color: '#fff', opacity: 100, type: 'solid' }],
      [null],
      { center: { x: 60, y: 40 }, degrees: 30, localBounds: { height: 40, width: 100, x: 10, y: 20 } },
    );
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

  it('should draw the stroke paints as a ring (outer and inner polygon) through the shared vector fill group, after the fills', () => {
    // mock
    const node = rect({ strokeAlign: StrokeAlign.inside, strokeWidth: 2, strokes: [{ color: '#f00', opacity: 100, type: 'solid' }] });

    // action
    drawBoxLeafNode(context, node, 1, nodesById, pathOutlineStyles, refs, editingPathId);

    // result
    expect(getBoxStrokePolygonsMock).toHaveBeenCalledWith(
      node,
      { bottom: 2, left: 2, right: 2, top: 2 },
      StrokeAlign.inside,
      StrokeJoin.miter,
    );
    expect(drawVectorFillGroupMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillGroupMock).toHaveBeenLastCalledWith(
      context,
      null,
      null,
      [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]],
      [{ color: '#f00', opacity: 100, type: 'solid' }],
      [null],
      DEFAULT_BOX_ROTATION,
    );
  });

  it('should not draw stroke paints when there are none or the stroke width is missing', () => {
    // action
    drawBoxLeafNode(context, rect({ strokeWidth: 2, strokes: [] }), 1, nodesById, pathOutlineStyles, refs, editingPathId);
    drawBoxLeafNode(
      context,
      rect({ strokes: [{ color: '#f00', opacity: 100, type: 'solid' }] }),
      1,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
    );

    // result — only the two fills were drawn
    expect(getBoxStrokePolygonsMock).not.toHaveBeenCalled();
    expect(drawVectorFillGroupMock).toHaveBeenCalledTimes(2);
  });
});
