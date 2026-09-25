// others
import { IMAGE_EDITOR_CROP_OVERFLOW_ALPHA } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { drawImageEditorOverflowQuad } from '../drawImageEditorOverflowQuad';

const flipMock = vi.fn((uv: unknown) => uv);
const quadMock = vi.fn(() => [1, 2, 3, 4]);

vi.mock('utils/canvas/drawVectorNode/getFlippedImageFillUv', () => ({
  getFlippedImageFillUv: (...args: unknown[]): unknown => flipMock(...(args as [unknown])),
}));
vi.mock('utils/canvas/drawVectorNode/getImageFillQuadVertices', () => ({
  getImageFillQuadVertices: (...args: unknown[]): unknown => quadMock(...(args as [])),
}));

describe('drawImageEditorOverflowQuad', () => {
  it('should draw the whole image faded over its crop rect with the paint rotation and flips', () => {
    // mock
    const gl = createGlProxy({ getAttribLocation: vi.fn(() => 2) });
    const context = {
      buffer: {},
      canvasHeight: 100,
      canvasWidth: 200,
      gl,
      imageContext: { program: {} },
      viewport: { x: 1, y: 2, zoom: 3 },
    } as unknown as TDrawSceneContext;
    const rect = { height: 10, rotation: 15, width: 20, x: 0, y: 0 };

    // before
    drawImageEditorOverflowQuad(context, rect, { flipX: true, rotation: 90 } as TImagePaint, {} as WebGLTexture);

    // result
    expect(flipMock).toHaveBeenCalledWith({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 }, true, false);
    expect(quadMock).toHaveBeenCalledWith(rect, { uMax: 1, uMin: 0, vMax: 1, vMin: 0 }, 90, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith({}, IMAGE_EDITOR_CROP_OVERFLOW_ALPHA);
    expect(gl.bufferData).toHaveBeenCalledWith('ARRAY_BUFFER', new Float32Array([1, 2, 3, 4]), 'STATIC_DRAW');
    expect(gl.drawArrays).toHaveBeenCalledWith('TRIANGLES', 0, 6);
  });
});
