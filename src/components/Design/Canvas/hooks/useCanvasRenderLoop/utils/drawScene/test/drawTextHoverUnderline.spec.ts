// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { drawTextHoverUnderline } from '../drawTextHoverUnderline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform2f: vi.fn(),
    uniform1f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'hello',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'a',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 400,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawTextHoverUnderline', () => {
  it('should draw a single underline for single-line content', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawTextHoverUnderline(gl, program, buffer, buildNode(), 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it('should draw one underline per line, each sized to its own content, not the widest line', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({ content: 'a much longer first line\nshort' });

    // before
    drawTextHoverUnderline(gl, program, buffer, node, 100, 100, IDENTITY_VIEWPORT);

    // result — two explicit lines (split on \n) means two separate underline segments
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);

    const firstCallVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1];
    const secondCallVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1];

    expect(firstCallVertices).not.toEqual(secondCallVertices);
  });

  it('should mirror the underline position when the node is flipped, matching the mirrored glyphs', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawTextHoverUnderline(gl, program, buffer, buildNode(), 100, 100, IDENTITY_VIEWPORT);
    const unflippedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1];

    drawTextHoverUnderline(gl, program, buffer, buildNode({ flipX: true }), 100, 100, IDENTITY_VIEWPORT);
    const flippedVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1];

    // result — same content, same box, but the underline moved because flipX mirrored it
    expect(flippedVertices).not.toEqual(unflippedVertices);
  });
});
