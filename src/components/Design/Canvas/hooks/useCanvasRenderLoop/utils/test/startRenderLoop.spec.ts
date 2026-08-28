import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCornerRadiusDragState, TPolygonCornerRadiusDragState } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { startRenderLoop } from '../startRenderLoop';

let rafCallback: FrameRequestCallback | undefined;

const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
  rafCallback = callback;

  return 1;
});
const cancelAnimationFrameMock = vi.fn();
const IMAGE_CONTEXT: TImageRenderContext = {
  buffer: {} as WebGLBuffer,
  cache: new Map(),
  ellipseArcLengthCache: new Map(),
  faceBufferCache: new WeakMap(),
  gridBuffer: {} as WebGLBuffer,
  gridProgram: {} as WebGLProgram,
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  strokeBufferCache: new WeakMap(),
  textGeometryCache: new Map(),
};

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const createFullGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    COLOR_BUFFER_BIT: 16384,
    FLOAT: 5126,
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const addRectangleNode = (): string => {
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

  return rootOrder[rootOrder.length - 1];
};

describe('startRenderLoop', () => {
  beforeEach(() => {
    rafCallback = undefined;
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    requestAnimationFrameMock.mockClear();
    cancelAnimationFrameMock.mockClear();
  });

  it('should draw a frame immediately on the next animation frame', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // action
    rafCallback?.(0);

    // result
    expect(gl.clear).toHaveBeenCalledTimes(1);
  });

  it('should schedule the next frame after drawing', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // action
    rafCallback?.(0);

    // result
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(2);
  });

  it('should keep drawing across multiple animation frames', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // action
    rafCallback?.(0);
    rafCallback?.(16);

    // result
    expect(gl.clear).toHaveBeenCalledTimes(2);
  });

  it('should cancel the scheduled frame when the returned stop function is called', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    const stopRenderLoop = startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs());

    // action
    stopRenderLoop();

    // result
    expect(cancelAnimationFrameMock).toHaveBeenCalledTimes(1);
  });

  it('should treat a corner-radius drag as active when the rectangle drag ref has a current value', () => {
    // mock — mid-drag to radius 0, the handle must keep tracking the pointer instead of jumping to
    // the zero-state offset; this proves the flag reaches drawScene from this layer's own refs.
    // Compares two renders of the identical scene rather than indexing into a specific draw call,
    // since other tests in this shared store leave committed nodes behind that shift call order.
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');
    const rectId = addRectangleNode();

    store.dispatch(setSelection([rectId]));

    const hoverRef: RefObject<string | null> = { current: rectId };

    // before
    const restingGl = createFullGlMock();

    startRenderLoop(restingGl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef } }));
    rafCallback?.(0);

    // action
    const draggingGl = createFullGlMock();
    const cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null> = {
      current: {
        bounds: { height: 100, width: 100, x: 0, y: 0 },
        candidates: ['ne'],
        corner: 'ne',
        hasMoved: true,
        nodeId: rectId,
        pointerStart: { x: 0, y: 0 },
        rotation: 0,
      },
    };

    startRenderLoop(
      draggingGl,
      program,
      buffer,
      IMAGE_CONTEXT,
      canvas,
      createCanvasRefs({ cornerRadius: { cornerRadiusDragRef }, hover: { hoverRef } }),
    );
    rafCallback?.(0);

    // result
    expect((draggingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls).not.toEqual(
      (restingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls,
    );

    // after
    store.dispatch(setSelection([]));
  });

  it('should treat a corner-radius drag as active when only the polygon drag ref has a current value', () => {
    // mock — same as above, but via the polygon ref alone, proving the OR's right-hand side works too
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');
    const rectId = addRectangleNode();

    store.dispatch(setSelection([rectId]));

    const hoverRef: RefObject<string | null> = { current: rectId };

    // before
    const restingGl = createFullGlMock();

    startRenderLoop(restingGl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef } }));
    rafCallback?.(0);

    // action
    const draggingGl = createFullGlMock();
    const polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null> = {
      current: {
        bounds: { height: 100, width: 100, x: 0, y: 0 },
        flipX: false,
        flipY: false,
        hasMoved: true,
        nodeId: 'some-other-polygon',
        rotation: 0,
        sides: 3,
      },
    };

    startRenderLoop(
      draggingGl,
      program,
      buffer,
      IMAGE_CONTEXT,
      canvas,
      createCanvasRefs({ cornerRadius: { polygonCornerRadiusDragRef }, hover: { hoverRef } }),
    );
    rafCallback?.(0);

    // result
    expect((draggingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls).not.toEqual(
      (restingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls,
    );

    // after
    store.dispatch(setSelection([]));
  });

  it('should NOT treat a corner-radius drag as active immediately after arming, before the pointer has actually moved', () => {
    // mock — grabbing the zero-state handle (pointerdown) must not itself relocate it; only a real
    // pointermove (which flips hasMoved via continueCornerRadiusDrag) should switch it to the literal
    // radius, otherwise the handle visibly jumps out from under the cursor on a plain click
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');
    const rectId = addRectangleNode();

    store.dispatch(setSelection([rectId]));

    const hoverRef: RefObject<string | null> = { current: rectId };

    // before
    const restingGl = createFullGlMock();

    startRenderLoop(restingGl, program, buffer, IMAGE_CONTEXT, canvas, createCanvasRefs({ hover: { hoverRef } }));
    rafCallback?.(0);

    // action — armed (ref has a current value) but hasMoved is still false, as armCornerRadiusDrag leaves it
    const justArmedGl = createFullGlMock();
    const cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null> = {
      current: {
        bounds: { height: 100, width: 100, x: 0, y: 0 },
        candidates: ['ne'],
        corner: 'ne',
        hasMoved: false,
        nodeId: rectId,
        pointerStart: { x: 0, y: 0 },
        rotation: 0,
      },
    };

    startRenderLoop(
      justArmedGl,
      program,
      buffer,
      IMAGE_CONTEXT,
      canvas,
      createCanvasRefs({ cornerRadius: { cornerRadiusDragRef }, hover: { hoverRef } }),
    );
    rafCallback?.(0);

    // result — same render as resting, since the drag isn't treated as active yet
    expect((justArmedGl.bufferData as ReturnType<typeof vi.fn>).mock.calls).toEqual(
      (restingGl.bufferData as ReturnType<typeof vi.fn>).mock.calls,
    );

    // after
    store.dispatch(setSelection([]));
  });
});
