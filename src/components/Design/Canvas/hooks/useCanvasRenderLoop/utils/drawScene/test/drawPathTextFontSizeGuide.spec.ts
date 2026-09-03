// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawPathTextFontSizeGuide } from '../drawPathTextFontSizeGuide';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    STATIC_DRAW: 35044,
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
  fontSize: 20,
  height: 200,
  id: 'a',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 100,
  y: 100,
  ...overrides,
});

describe('drawPathTextFontSizeGuide', () => {
  it('should draw a dashed guide outline for a selected path-text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathTextFontSizeGuide(gl, program, buffer, buildPathText(), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });

  it("should pad the guide outward by the node's own font size", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — top-left of the guide rect sits fontSize px above/left of the node's own box
    drawPathTextFontSizeGuide(
      gl,
      program,
      buffer,
      buildPathText({ fontSize: 20, height: 200, width: 200, x: 100, y: 100 }),
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(80);
    expect(vertices[1]).toBeCloseTo(80);
  });

  it("should keep the padding equal to the node's own font size regardless of zoom, unlike a screen-pixel-constant size", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — zoomed in 2x; the padding must still be exactly fontSize in world space, not fontSize / zoom
    drawPathTextFontSizeGuide(gl, program, buffer, buildPathText({ fontSize: 20, height: 200, width: 200, x: 100, y: 100 }), 100, 100, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(vertices[0]).toBeCloseTo(80);
    expect(vertices[1]).toBeCloseTo(80);
  });

  it('should draw nothing for an ordinary (non-path) text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawPathTextFontSizeGuide(gl, program, buffer, buildPathText({ pathId: null }), 100, 100, IDENTITY_VIEWPORT);

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
    drawPathTextFontSizeGuide(gl, program, buffer, frame, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
