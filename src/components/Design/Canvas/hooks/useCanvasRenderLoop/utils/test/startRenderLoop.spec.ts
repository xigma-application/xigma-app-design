// types
import { TImageRenderContext } from '../../types';

// utils
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
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  textGeometryCache: new Map(),
};

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

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
    startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas);

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
    startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas);

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
    startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas);

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
    const stopRenderLoop = startRenderLoop(gl, program, buffer, IMAGE_CONTEXT, canvas);

    // action
    stopRenderLoop();

    // result
    expect(cancelAnimationFrameMock).toHaveBeenCalledTimes(1);
  });
});
