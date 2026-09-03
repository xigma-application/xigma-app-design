// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawSelectedPathTextHandle } from '../drawSelectedPathTextHandle';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
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

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'a',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawSelectedPathTextHandle', () => {
  it('should draw the offset handle for a selected path-text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSelectedPathTextHandle(gl, program, buffer, buildPathText(), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw nothing for an ordinary (non-path) text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSelectedPathTextHandle(gl, program, buffer, buildPathText({ pathId: null }), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing for a non-text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const frame: TSceneNode = {
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 10,
      id: 'a',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawSelectedPathTextHandle(gl, program, buffer, frame, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
