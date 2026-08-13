// store
import { addNode, setSelection, startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../../types';

// utils
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
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  textGeometryCache: new Map(),
};

describe('drawScene', () => {
  it('should re-enable alpha writes for the background clear, then lock them for foreground drawing', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

    // result
    expect((gl.colorMask as ReturnType<typeof vi.fn>).mock.calls).toEqual([
      [true, true, true, true],
      [true, true, true, false],
    ]);
    expect(gl.clear).toHaveBeenCalledTimes(1);
  });

  it('should not draw a draft rect when none is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

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
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, { fill: '#FFFFFF', height: 20, type: NodeType.frame, width: 10, x: 0, y: 0 });

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(9);
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
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
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

    const { rootOrder } = store.getState().design;
    const hoveredId = rootOrder[rootOrder.length - 1];

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, null, null, hoveredId);

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

    const { rootOrder } = store.getState().design;
    const selectedId = rootOrder[rootOrder.length - 1];

    // action
    store.dispatch(setSelection([selectedId]));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

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

    const { rootOrder } = store.getState().design;
    const [idA, idB] = rootOrder.slice(-2);

    // action
    store.dispatch(setSelection([idA, idB]));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    // one shared outline + 4 corner handles = 5 LINE_LOOP draws, not 10 (2 nodes x 5)
    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should fall back to per-node outlines when the selection spans different parents', () => {
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

    const { rootOrder } = store.getState().design;
    const [idA, idB] = rootOrder.slice(-2);

    // action
    store.dispatch(setSelection([idA, idB]));

    // before
    drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    // 2 separate node outlines + handles = 10 LINE_LOOP draws, not 5 (one shared box)
    expect(lineLoopDraws).toHaveLength(10);
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

    const { rootOrder } = store.getState().design;
    const editingId = rootOrder[rootOrder.length - 1];

    const countFillDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas);

      return (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([mode, offset, count]) => mode === gl.TRIANGLES && offset === 0 && count === 6,
      ).length;
    };

    // before
    const baselineCount = countFillDraws();

    // action
    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 10, x: 0, y: 0 }, id: editingId }));

    // result — the node's own fill triangle-fan draw is suppressed while it's being text-edited
    expect(countFillDraws()).toBe(baselineCount - 1);

    // after
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

    const { rootOrder } = store.getState().design;
    const editingId = rootOrder[rootOrder.length - 1];

    const countHoverOutlineDraws = (): number => {
      const gl = createGlMock();

      drawScene(gl, program, buffer, IMAGE_CONTEXT, canvas, null, null, editingId);

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
});
