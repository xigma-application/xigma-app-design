// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { setupRenderLoop } from '../setupRenderLoop';

let rafCallback: FrameRequestCallback | undefined;

const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
  rafCallback = callback;

  return 1;
});
const cancelAnimationFrameMock = vi.fn();

const createGlMock = (): WebGL2RenderingContext =>
  ({
    BLEND: 3042,
    COLOR_BUFFER_BIT: 16384,
    ONE_MINUS_SRC_ALPHA: 771,
    SRC_ALPHA: 770,
    blendFunc: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    enable: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('setupRenderLoop', () => {
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

  it('should enable straight-alpha blending before drawing anything', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const imageProgram = {} as WebGLProgram;
    const imageBuffer = {} as WebGLBuffer;
    const msdfProgram = {} as WebGLProgram;
    const msdfBuffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    setupRenderLoop(gl, program, buffer, imageProgram, imageBuffer, msdfProgram, msdfBuffer, canvas, createCanvasRefs());

    // result
    expect(gl.enable).toHaveBeenCalledWith(gl.BLEND);
    expect(gl.blendFunc).toHaveBeenCalledWith(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  });

  it('should start the render loop and return a stop callback', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const imageProgram = {} as WebGLProgram;
    const imageBuffer = {} as WebGLBuffer;
    const msdfProgram = {} as WebGLProgram;
    const msdfBuffer = {} as WebGLBuffer;
    const canvas = document.createElement('canvas');

    // before
    const stopRenderLoop = setupRenderLoop(
      gl,
      program,
      buffer,
      imageProgram,
      imageBuffer,
      msdfProgram,
      msdfBuffer,
      canvas,
      createCanvasRefs(),
    );

    // action
    rafCallback?.(0);

    // result
    expect(gl.clear).toHaveBeenCalledTimes(1);

    // action
    stopRenderLoop();

    // result
    expect(cancelAnimationFrameMock).toHaveBeenCalledTimes(1);
  });
});
