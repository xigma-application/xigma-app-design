// types
import { NodeType, PathType } from 'types/design/enums';
import { TDrawContext } from '../types';
import { TPathNode } from 'types/design/types';

// utils
import { drawPathOutline } from '../drawPathOutline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
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

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const buildContext = (gl: WebGL2RenderingContext, program: WebGLProgram, buffer: WebGLBuffer): TDrawContext => ({
  buffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl,
  program,
  viewport: IDENTITY_VIEWPORT,
});

const buildNode = (overrides: Partial<TPathNode> = {}): TPathNode => ({
  height: 10,
  id: 'a',
  name: 'Path',
  parentId: null,
  pathType: PathType.ellipse,
  rotation: 0,
  type: NodeType.path,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPathOutline', () => {
  it('should draw nothing when the path has no outline style', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathOutline(buildContext(gl, program, buffer), buildNode(), undefined);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a thin hairline ellipse when selected', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathOutline(buildContext(gl, program, buffer), buildNode(), 'selected');

    // result — a stroke-only ellipse draws a LINE_LOOP, not a thick triangulated ring
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));
  });

  it('should draw a thick triangulated ring when hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathOutline(buildContext(gl, program, buffer), buildNode(), 'hover');

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should draw a dashed ellipse when editing', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathOutline(buildContext(gl, program, buffer), buildNode(), 'editing');

    // result — a dashed outline draws disconnected line segments, not a closed LINE_LOOP or a thick ring
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });
});
