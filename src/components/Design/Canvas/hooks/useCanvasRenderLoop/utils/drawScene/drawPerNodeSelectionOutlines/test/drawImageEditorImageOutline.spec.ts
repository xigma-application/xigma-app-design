// others
import { IMAGE_EDITOR_GUIDE_OUTLINE_INNER, IMAGE_EDITOR_GUIDE_OUTLINE_OUTER } from 'constant/canvas';

// utils
import { drawImageEditorImageOutline } from '../drawImageEditorImageOutline';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

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

const crop = { height: 40, rotation: 0, width: 40, x: 0, y: 0 };

describe('drawImageEditorImageOutline', () => {
  it('should draw a two-tone 1px+1px guide outline when inactive, no corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorImageOutline(gl, program, buffer, crop, 100, 100, IDENTITY_VIEWPORT, false);

    // result — an outer #252525 line at the exact bounds, an inner #9F9F9F line inset by 1px
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls.map(([, color]) => color);

    expect(lineLoopDraws).toHaveLength(2);
    expect(trianglesDraws).toHaveLength(0);
    expect(colorCalls[0]).toEqual(hexToRgbaFloat(IMAGE_EDITOR_GUIDE_OUTLINE_OUTER));
    expect(colorCalls[1]).toEqual(hexToRgbaFloat(IMAGE_EDITOR_GUIDE_OUTLINE_INNER));

    const outerVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;
    const innerVertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    expect(Array.from(outerVertices.slice(0, 2))).toEqual([0, 0]);
    expect(Array.from(innerVertices.slice(0, 2))).toEqual([1, 1]);
  });

  it('should additionally draw 4 corner handles when active', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorImageOutline(gl, program, buffer, crop, 100, 100, IDENTITY_VIEWPORT, true);

    // result — outline + 4 handle strokes = 5 LINE_LOOP, plus 4 handle fills = 4 TRIANGLES
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(lineLoopDraws).toHaveLength(5);
    expect(trianglesDraws).toHaveLength(4);
  });
});
