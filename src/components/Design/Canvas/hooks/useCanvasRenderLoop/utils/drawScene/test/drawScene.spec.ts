// others
import { CARET_BLINK_INTERVAL_MS, GRID_MIN_ZOOM } from 'constant/canvas';

// store
import { addNode, setSelection, setViewport, startTextEdit, stopTextEdit, toggleNodeHidden } from 'store/design/slice';
import { DEFAULT_VIEWPORT } from 'store/design/constants';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../../types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawScene } from '../drawScene';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    COLOR_BUFFER_BIT: 16384,
    FLOAT: 5126,
    LINE_LOOP: 2,
    RGBA: 6408,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    createTexture: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IMAGE_CONTEXT: TImageRenderContext = {
  buffer: {} as WebGLBuffer,
  cache: new Map(),
  ellipseArcLengthCache: new Map(),
  faceBufferCache: new WeakMap(),
  gridBuffer: {} as WebGLBuffer,
  gridProgram: {} as WebGLProgram,
  maskCompositeBuffer: {} as WebGLBuffer,
  maskCompositeProgram: {} as WebGLProgram,
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  renderTargetPool: {} as TImageRenderContext['renderTargetPool'],
  strokeBufferCache: new WeakMap(),
  textGeometryCache: new Map(),
  vertexDotBufferCache: new WeakMap(),
};

describe('drawScene', () => {
  it('should re-enable alpha writes for the background clear, then lock them for foreground drawing', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    expect((gl.colorMask as ReturnType<typeof vi.fn>).mock.calls).toEqual([
      [true, true, true, true],
      [true, true, true, false],
    ]);
    expect(gl.clear).toHaveBeenCalledTimes(1);
  });

  it('should not draw the pixel grid below the minimum zoom threshold', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw the pixel grid once zoomed in to the minimum threshold', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(setViewport({ x: 0, y: 0, zoom: GRID_MIN_ZOOM }));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

    // after
    store.dispatch(setViewport(DEFAULT_VIEWPORT));
  });

  it('should not draw a draft rect when none is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the draft rect and its 4 corner handles when given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    drawScene(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      canvas,
      createCanvasRefs({ draftRef: { current: { fill: '#FFFFFF', height: 20, type: NodeType.frame, width: 10, x: 0, y: 0 } } }),
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(10);
  });

  it('should draw every node currently in the scene', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Frame 1',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should not draw a hidden node', () => {
    // mock
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#336699',
        height: 20,
        name: 'Hidden Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        // wide enough that its name label isn't ellipsis-truncated down to a single glyph, which
        // would coincidentally match countFillDraws' (TRIANGLES, 0, 6) signature below
        width: 300,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const hiddenId = rootOrder[rootOrder.length - 1];

    const countFillDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([mode, offset, count]) => mode === gl.TRIANGLES && offset === 0 && count === 6,
      ).length;
    };

    // before
    const baselineCount = countFillDraws();

    // action
    store.dispatch(toggleNodeHidden(hiddenId));

    // result
    expect(countFillDraws()).toBe(baselineCount - 1);

    // after
    store.dispatch(toggleNodeHidden(hiddenId));
  });

  it('should draw a hover outline for the given hoveredNodeId', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#ff9900',
        height: 20,
        name: 'Frame 3',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const hoveredId = rootOrder[rootOrder.length - 1];

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef: { current: hoveredId } } }));

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should draw a selection outline and corner handles for each selected node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#00ff00',
        height: 20,
        name: 'Frame 2',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const selectedId = rootOrder[rootOrder.length - 1];

    // action
    store.dispatch(setSelection([selectedId]));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should draw one shared outline and 4 handles for a same-parent multi-selection, not per node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#0000ff',
        height: 10,
        name: 'Group A',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 100,
        y: 100,
      }),
    );
    store.dispatch(
      addNode({
        fill: '#0000ff',
        height: 10,
        name: 'Group B',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 200,
        y: 100,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const [idA, idB] = rootOrder.slice(-2);

    // action
    store.dispatch(setSelection([idA, idB]));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    // one shared outline + 4 corner handles = 5 LINE_LOOP draws, not 10 (2 nodes x 5)
    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should still render one shared group outline for a multi-selection spanning different parents', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#ff00ff',
        height: 10,
        name: 'Child of A',
        parentId: 'frame-a',
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 300,
        y: 100,
      }),
    );
    store.dispatch(
      addNode({
        fill: '#ff00ff',
        height: 10,
        name: 'Child of B',
        parentId: 'frame-b',
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 400,
        y: 100,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const [idA, idB] = rootOrder.slice(-2);

    // action
    store.dispatch(setSelection([idA, idB]));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    // parentId isn't a reliable "flat sibling" signal once nodes can sit inside a group — one shared
    // outline + 4 corner handles = 5 LINE_LOOP draws, not 10 (2 separate per-node outlines)
    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should exclude the node currently being text-edited from its own fill rendering', () => {
    // mock
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#123456',
        height: 20,
        name: 'Editing Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const editingId = rootOrder[rootOrder.length - 1];

    const countFillDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([mode, offset, count]) => mode === gl.TRIANGLES && offset === 0 && count === 6,
      ).length;
    };

    // before
    const baselineCount = countFillDraws();

    // action
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 10, x: 0, y: 0 }, id: editingId }));
    dateNowSpy.mockReturnValue(CARET_BLINK_INTERVAL_MS);

    // result — the node's own fill triangle-fan draw is suppressed while it's being text-edited
    expect(countFillDraws()).toBe(baselineCount - 1);

    // after
    vi.restoreAllMocks();
    store.dispatch(stopTextEdit());
  });

  it('should exclude the node currently being text-edited from the hover outline, even if it is the hovered id', () => {
    // mock
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#654321',
        height: 20,
        name: 'Editing Frame 2',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const editingId = rootOrder[rootOrder.length - 1];

    const countHoverOutlineDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef: { current: editingId } } }));

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([mode, offset, count]) => mode === gl.TRIANGLES && offset === 0 && count === 24,
      ).length;
    };

    // before — hovered, not yet being edited
    const baselineCount = countHoverOutlineDraws();

    // action
    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 10, x: 0, y: 0 }, id: editingId }));

    // result — hovering it while it's also being edited must not add the thick-outline draw
    expect(countHoverOutlineDraws()).toBe(baselineCount - 1);

    // after
    store.dispatch(stopTextEdit());
  });

  it('should still draw the path-text offset handle for the node currently being text-edited', () => {
    // mock — unlike its box/corner-handles/hover-outline, the offset handle for a path-text node
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 200,
        name: 'Text',
        parentId: null,
        pathFlip: false,
        pathId: 'ellipse-1',
        pathStartOffset: 0,
        rotation: 0,
        type: NodeType.text,
        width: 200,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const editingId = rootOrder[rootOrder.length - 1];

    const countTriangleFanDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN).length;
    };

    // before — not yet being edited
    const baselineCount = countTriangleFanDraws();

    // action
    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 200, pathId: 'ellipse-1', pathStartOffset: 0, rotation: 0, width: 200, x: 0, y: 0 },
        content: 'Hi',
        id: editingId,
      }),
    );

    // result — the handle's own filled ellipse adds one more TRIANGLE_FAN draw
    expect(countTriangleFanDraws()).toBe(baselineCount + 1);

    // after
    store.dispatch(stopTextEdit());
  });

  it('should draw the 4 corner-radius handles for a rounded rectangle only when it is both selected and hovered', () => {
    // mock
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        cornerRadius: 15,
        fill: '#aabbcc',
        height: 100,
        name: 'Rounded Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const rectId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([rectId]));

    const countTriangleFanDraws = (hoveredNodeId: string | null): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef: { current: hoveredNodeId } } }));

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN).length;
    };

    // before — selected but not hovered: only the rounded rect's own fill uses TRIANGLE_FAN
    const selectedOnlyCount = countTriangleFanDraws(null);

    // action
    const hoveredCount = countTriangleFanDraws(rectId);

    // result — hovering adds exactly the 4 corner-radius handle fills
    expect(hoveredCount).toBe(selectedOnlyCount + 4);

    // after
    store.dispatch(setSelection([]));
  });

  it('should draw the vertex-count handle for a polygon only when it is both selected and hovered', () => {
    // mock
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        fill: '#aabbcc',
        flipX: false,
        flipY: false,
        height: 100,
        name: 'Vertex Count Polygon',
        parentId: null,
        rotation: 0,
        sides: 3,
        type: NodeType.polygon,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const polygonId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([polygonId]));

    const countTriangleFanDraws = (hoveredNodeId: string | null): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef: { current: hoveredNodeId } } }));

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN).length;
    };

    // before — selected but not hovered: only the polygon's own fill uses TRIANGLE_FAN
    const selectedOnlyCount = countTriangleFanDraws(null);

    // action
    const hoveredCount = countTriangleFanDraws(polygonId);

    // result — hovering adds both the polygon's own corner-radius handle fill and its vertex-count handle fill
    expect(hoveredCount).toBe(selectedOnlyCount + 2);

    // after
    store.dispatch(setSelection([]));
  });

  it('should render the corner-radius handle differently at radius 0 depending on isDraggingCornerRadius', () => {
    // mock — mid-drag to radius 0, the handle must keep tracking the pointer instead of jumping to
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    store.dispatch(
      addNode({
        cornerRadius: 0,
        fill: '#aabbcc',
        height: 100,
        name: 'Dragging Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const rectId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([rectId]));

    // before
    const restingGl = createGlMock();

    drawScene(restingGl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef: { current: rectId } } }));

    // action
    const draggingGl = createGlMock();

    drawScene(
      draggingGl,
      program,
      buffer,
      IMAGE_CONTEXT,
      canvas,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: {
            current: {
              bounds: { height: 100, width: 100, x: 0, y: 0 },
              candidates: ['ne'],
              corner: 'ne',
              hasMoved: true,
              nodeId: rectId,
              pointerStart: { x: 0, y: 0 },
              rotation: 0,
            },
          },
        },
        hover: { hoverRef: { current: rectId } },
      }),
    );

    // result
    expect((draggingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls).not.toEqual(
      (restingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls,
    );

    // after
    store.dispatch(setSelection([]));
  });

  it('should draw the path-text offset handle while a path-text node is being created for the first time', () => {
    // mock — first-time creation (useDrawTextOnPathTool) dispatches startTextEdit without an id,
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    const countTriangleFanDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN).length;
    };

    // before — nothing being edited
    const baselineCount = countTriangleFanDraws();

    // action
    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 200, pathId: 'ellipse-1', pathStartOffset: 0, rotation: 0, width: 200, x: 0, y: 0 },
        content: '',
      }),
    );

    // result — the handle's own filled ellipse adds one more TRIANGLE_FAN draw
    expect(countTriangleFanDraws()).toBe(baselineCount + 1);

    // after
    store.dispatch(stopTextEdit());
  });
});
