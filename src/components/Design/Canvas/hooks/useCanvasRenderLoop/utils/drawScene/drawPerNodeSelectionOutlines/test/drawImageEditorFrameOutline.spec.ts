// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { drawImageEditorFrameOutline } from '../drawImageEditorFrameOutline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
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

const node: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 40,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 40,
  x: 0,
  y: 0,
};

describe('drawImageEditorFrameOutline', () => {
  it('should draw only the dashed guide outline when inactive, no corner/edge handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorFrameOutline(gl, program, buffer, node, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    const linesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINES);
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(linesDraws).toHaveLength(1);
    expect(trianglesDraws).toHaveLength(0);
  });

  it('should additionally draw the corner and edge handles when active', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorFrameOutline(gl, program, buffer, node, 100, 100, IDENTITY_VIEWPORT, true);

    // result — 4 corners x 2 arms + 4 edge bars = 12 TRIANGLES draws
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(12);
  });
});
