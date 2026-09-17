// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TImageEditorState } from 'store/design/types';

// utils
import { drawImageEditorCropImageOutline } from '../drawImageEditorCropImageOutline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
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

const draw = (gl: WebGL2RenderingContext, testNode: TFrameNode, imageEditor: TImageEditorState): void => {
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;

  drawImageEditorCropImageOutline(gl, program, buffer, testNode, 100, 100, IDENTITY_VIEWPORT, imageEditor, false);
};

describe('drawImageEditorCropImageOutline', () => {
  it('should draw nothing when not in crop mode', () => {
    // mock
    const gl = createGlMock();

    // before
    draw(gl, node, { mode: 'position', nodeId: 'frame-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the node has no fills to draw an appearance from', () => {
    // mock
    const gl = createGlMock();
    const rectNode = { ...node, fills: [] };

    // before
    draw(gl, rectNode, { mode: 'crop', nodeId: 'frame-1', paintIndex: 0, selectedTarget: 'frame' });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced paint is not an image paint', () => {
    // mock
    const gl = createGlMock();
    const solidFillNode: TFrameNode = { ...node, fills: [{ color: '#000000', opacity: 100, type: 'solid' }] };

    // before
    draw(gl, solidFillNode, { mode: 'crop', nodeId: 'frame-1', paintIndex: 0, selectedTarget: 'frame' });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the image outline when in crop mode with an image paint', () => {
    // mock
    const gl = createGlMock();

    // before
    draw(gl, node, { mode: 'crop', nodeId: 'frame-1', paintIndex: 0, selectedTarget: 'frame' });

    // result — two-tone guide outline, since isImageSelected is false
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(2);
  });
});
