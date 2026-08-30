// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

// utils
import { drawValueLabelText } from '../drawValueLabelText';

const drawMsdfGlyphsMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();
const translateGlyphVerticesMock = vi.fn();
const rotateGlyphVerticesMock = vi.fn();

vi.mock('../../drawMsdfGlyphs', () => ({
  drawMsdfGlyphs: (...args: unknown[]): void => drawMsdfGlyphsMock(...args),
}));
vi.mock('../../getMsdfAtlasTexture', () => ({
  getMsdfAtlasTexture: (...args: unknown[]): unknown => getMsdfAtlasTextureMock(...args),
}));
vi.mock('../../translateGlyphVertices', () => ({
  translateGlyphVertices: (...args: unknown[]): unknown => translateGlyphVerticesMock(...args),
}));
vi.mock('../../rotateGlyphVertices', () => ({
  rotateGlyphVertices: (...args: unknown[]): unknown => rotateGlyphVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const imageContext = { cache: new Map(), msdfBuffer: {}, msdfProgram: {} } as unknown as TImageRenderContext;
// a single glyph spanning x:[-6,6], y:[-9,9] around its own local origin
const bounds = { maxX: 6, maxY: 9, minX: -6, minY: -9 };
const rawVertices = new Float32Array();

describe('drawValueLabelText', () => {
  beforeEach(() => {
    drawMsdfGlyphsMock.mockClear();
    getMsdfAtlasTextureMock.mockClear().mockReturnValue({});
    translateGlyphVerticesMock.mockClear().mockReturnValue(new Float32Array());
    rotateGlyphVerticesMock.mockClear().mockImplementation((vertices: Float32Array) => vertices);
  });

  it('should translate the raw glyph vertices so their bounds center lands exactly on the badge center', () => {
    // before
    drawValueLabelText(gl, imageContext, rawVertices, bounds, { x: 100, y: 72 }, 0, 11, 200, 150, IDENTITY_VIEWPORT);

    // result — glyph bounds center is (0,0) locally, badge center is (100, 72)
    expect(translateGlyphVerticesMock).toHaveBeenCalledWith(rawVertices, 100, 72);
  });

  it('should rotate the translated vertices around the badge center by the given angle', () => {
    // before
    drawValueLabelText(gl, imageContext, rawVertices, bounds, { x: 100, y: 72 }, 30, 11, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(rotateGlyphVerticesMock).toHaveBeenCalledWith(translateGlyphVerticesMock.mock.results[0].value, { x: 100, y: 72 }, 30);
  });

  it('should draw the glyph quads using imageContext’s msdf program/buffer, not the plain flat-color ones', () => {
    // before
    drawValueLabelText(gl, imageContext, rawVertices, bounds, { x: 100, y: 72 }, 0, 11, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawMsdfGlyphsMock).toHaveBeenCalledWith(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTextureMock.mock.results[0].value,
      expect.anything(),
      rotateGlyphVerticesMock.mock.results[0].value,
      '#ffffff',
      11,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
