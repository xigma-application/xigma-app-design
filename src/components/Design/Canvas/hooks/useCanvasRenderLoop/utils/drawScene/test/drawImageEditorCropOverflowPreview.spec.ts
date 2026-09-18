// others
import { IMAGE_EDITOR_CROP_OVERFLOW_ALPHA } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { drawImageEditorCropOverflowPreview } from '../drawImageEditorCropOverflowPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const texture = {} as WebGLTexture;
const placeholderTexture = {} as WebGLTexture;
const getOrCreateImagePlaceholderTextureMock = vi.fn(() => placeholderTexture);

vi.mock('utils/canvas/drawVectorNode/drawVectorImageFill/getOrCreateImagePlaceholderTexture', () => ({
  getOrCreateImagePlaceholderTexture: (...args: unknown[]): unknown => getOrCreateImagePlaceholderTextureMock(...args),
}));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    createTexture: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const createContext = (gl: WebGL2RenderingContext): TDrawSceneContext =>
  ({
    buffer: {} as WebGLBuffer,
    canvasHeight: 100,
    canvasWidth: 100,
    gl,
    imageContext: {
      cache: new Map([['image-1', texture]]),
      imagePaintTextureSizeCache: new Map(),
      program: { tag: 'image' } as unknown as WebGLProgram,
    },
    program: {} as WebGLProgram,
    viewport: IDENTITY_VIEWPORT,
  }) as unknown as TDrawSceneContext;

const rectangle: TRectangleNode = {
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('drawImageEditorCropOverflowPreview', () => {
  it('should do nothing when there is no active image editor', () => {
    // mock
    const gl = createGlMock();

    // before
    drawImageEditorCropOverflowPreview(createContext(gl), { 'rect-1': rectangle }, null);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing while still in position mode', () => {
    // mock
    const gl = createGlMock();

    // before
    drawImageEditorCropOverflowPreview(createContext(gl), { 'rect-1': rectangle }, { mode: 'position', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing when the targeted node no longer exists', () => {
    // mock
    const gl = createGlMock();

    // before
    drawImageEditorCropOverflowPreview(createContext(gl), {}, { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing when the targeted paint is not an image', () => {
    // mock
    const gl = createGlMock();
    const solidRectangle: TRectangleNode = { ...rectangle, fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] };

    // before
    drawImageEditorCropOverflowPreview(createContext(gl), { 'rect-1': solidRectangle }, { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should do nothing while the image has no crop of its own yet, since the normal fill already shows its full extent', () => {
    // mock — same rectangle as above, paint.crop is still unset (scaleMode-only fill)
    const gl = createGlMock();

    // before
    drawImageEditorCropOverflowPreview(createContext(gl), { 'rect-1': rectangle }, { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 });

    // result — drawing an unclipped full-image copy here would double-expose against the real
    // scaleMode-aware render, since it uses different UVs (this was a real, reported regression)
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw the stored crop rect, unclipped, at the fixed overflow alpha, once one exists', () => {
    // mock
    const gl = createGlMock();
    const croppedRectangle: TRectangleNode = {
      ...rectangle,
      fills: [
        {
          crop: { height: 40, rotation: 0, width: 40, x: 10, y: 5 },
          opacity: 100,
          ref: 'image-1',
          rotation: 0,
          scaleMode: 'fill',
          type: 'image',
        },
      ],
    };

    // before
    drawImageEditorCropOverflowPreview(
      createContext(gl),
      { 'rect-1': croppedRectangle },
      { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 },
    );

    // result
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), IMAGE_EDITOR_CROP_OVERFLOW_ALPHA);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

    const vertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(Array.from(vertices.slice(0, 2))).toEqual([10, 5]);
    expect(Array.from(vertices.slice(4, 6))).toEqual([50, 5]);
  });

  it("should mirror the preview's own UVs to match a mirrored paint (regression: the overflow preview always drew unflipped, so a mirrored image doubled/ghosted against its own correctly-flipped real render)", () => {
    // mock
    const gl = createGlMock();
    const flippedRectangle: TRectangleNode = {
      ...rectangle,
      fills: [
        {
          crop: { height: 40, rotation: 0, width: 40, x: 10, y: 5 },
          flipX: true,
          opacity: 100,
          ref: 'image-1',
          rotation: 0,
          scaleMode: 'fill',
          type: 'image',
        },
      ],
    };

    // before
    drawImageEditorCropOverflowPreview(
      createContext(gl),
      { 'rect-1': flippedRectangle },
      { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 },
    );

    // result — the first vertex's own UV (u, v) is mirrored on the u axis, not the default (0, 0)
    const vertices = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    expect(Array.from(vertices.slice(2, 4))).toEqual([1, 0]);
  });

  it('should preview the checker placeholder, dimmed at the overflow alpha, for an image with no asset picked yet', () => {
    // mock
    const gl = createGlMock();
    const croppedPlaceholderRectangle: TRectangleNode = {
      ...rectangle,
      fills: [
        { crop: { height: 40, rotation: 0, width: 40, x: 10, y: 5 }, opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' },
      ],
    };

    // before
    drawImageEditorCropOverflowPreview(
      createContext(gl),
      { 'rect-1': croppedPlaceholderRectangle },
      { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 },
    );

    // result
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, placeholderTexture);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), IMAGE_EDITOR_CROP_OVERFLOW_ALPHA);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });
});
