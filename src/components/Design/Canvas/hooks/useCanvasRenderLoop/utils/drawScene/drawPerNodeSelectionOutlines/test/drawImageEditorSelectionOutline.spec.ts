// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TImageEditorState } from 'store/design/types';

// utils
import { drawImageEditorSelectionOutline } from '../drawImageEditorSelectionOutline';

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
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
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

const draw = (gl: WebGL2RenderingContext, imageEditor: TImageEditorState): void => {
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;

  drawImageEditorSelectionOutline(gl, program, buffer, node, 100, 100, IDENTITY_VIEWPORT, imageEditor);
};

describe('drawImageEditorSelectionOutline', () => {
  it('should draw the frame active (with handles) and no image outline while in position mode', () => {
    // mock
    const gl = createGlMock();

    // before
    draw(gl, { mode: 'position', nodeId: 'frame-1', paintIndex: 0 });

    // result — frame active means 12 corner/edge-handle TRIANGLES draws, no image outline drawn at all
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(trianglesDraws).toHaveLength(12);
    expect(lineLoopDraws).toHaveLength(0);
  });

  it('should draw the frame active and a plain inactive image outline when the frame is the selected target in crop mode', () => {
    // mock
    const gl = createGlMock();

    // before
    draw(gl, { mode: 'crop', nodeId: 'frame-1', paintIndex: 0, selectedTarget: 'frame' });

    // result — frame active (12 TRIANGLES) + plain image outline (1 LINE_LOOP, no handle TRIANGLES)
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(trianglesDraws).toHaveLength(12);
    expect(lineLoopDraws).toHaveLength(1);
  });

  it('should draw the frame inactive (guide only) and an active image outline when the image is the selected target', () => {
    // mock
    const gl = createGlMock();

    // before
    draw(gl, { mode: 'crop', nodeId: 'frame-1', paintIndex: 0, selectedTarget: 'image' });

    // result — frame inactive (0 handle TRIANGLES) + active image outline (4 handle TRIANGLES, 5 LINE_LOOP)
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(trianglesDraws).toHaveLength(4);
    expect(lineLoopDraws).toHaveLength(5);
  });
});
