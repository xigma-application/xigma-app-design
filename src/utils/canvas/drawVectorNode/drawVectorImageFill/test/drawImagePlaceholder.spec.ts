// others
import { IMAGE_FILL_PLACEHOLDER_COLOR_A, IMAGE_FILL_PLACEHOLDER_COLOR_B } from 'constant/canvas';

// utils
import { createGlProxy, TGlProxy } from 'test/createGlProxy';
import { drawImagePlaceholder } from '../drawImagePlaceholder';
import { hexToRgbaFloat } from '../../../hexToRgbaFloat';

const drawImageStencilMaskMock = vi.fn();

vi.mock('../drawImageStencilMask', () => ({ drawImageStencilMask: (...args: unknown[]): unknown => drawImageStencilMaskMock(...args) }));
vi.mock('../../getImageFillPlaceholderVertices', () => ({
  getImageFillPlaceholderVertices: (): unknown => ({ squaresA: [0, 0, 1, 0, 1, 1], squaresB: [0, 0, 1, 1, 0, 1, 2, 2, 3, 3, 2, 3] }),
}));

const createGl = (): TGlProxy => createGlProxy({ getAttribLocation: vi.fn(() => 7) });

describe('drawImagePlaceholder', () => {
  it('should stencil the faces and paint the two checker colors inside them', () => {
    // mock
    const gl = createGl();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [[{ x: 0, y: 0 }]];

    // before
    drawImagePlaceholder(gl, program, buffer, null, faces, { height: 10, width: 10, x: 0, y: 0 }, 200, 100, { x: 1, y: 2, zoom: 3 }, true);

    // result
    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.uniform1f).toHaveBeenCalledWith({}, 3);
    expect(drawImageStencilMaskMock.mock.calls[0][0]).toBe(gl);
    expect(drawImageStencilMaskMock.mock.calls[0].slice(1)).toEqual([7, null, buffer, faces]);
    expect(gl.colorMask).toHaveBeenLastCalledWith(true, true, true, true);
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(1, {}, hexToRgbaFloat(IMAGE_FILL_PLACEHOLDER_COLOR_A, 1));
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, {}, hexToRgbaFloat(IMAGE_FILL_PLACEHOLDER_COLOR_B, 1));
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, 'TRIANGLES', 0, 3);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, 'TRIANGLES', 0, 6);
    expect(gl.disable).toHaveBeenCalledWith('STENCIL_TEST');
  });
});
