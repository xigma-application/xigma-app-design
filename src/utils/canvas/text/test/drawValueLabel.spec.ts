// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

// utils
import { drawValueLabel } from '../drawValueLabel';

const drawRectMock = vi.fn();
const drawMsdfGlyphsMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();
const buildGlyphQuadsMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();
const translateGlyphVerticesMock = vi.fn();
const rotateGlyphVerticesMock = vi.fn();

vi.mock('../../drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));
vi.mock('../drawMsdfGlyphs', () => ({
  drawMsdfGlyphs: (...args: unknown[]): void => drawMsdfGlyphsMock(...args),
}));
vi.mock('../getMsdfAtlasTexture', () => ({
  getMsdfAtlasTexture: (...args: unknown[]): unknown => getMsdfAtlasTextureMock(...args),
}));
vi.mock('../buildGlyphQuads', () => ({
  buildGlyphQuads: (...args: unknown[]): unknown => buildGlyphQuadsMock(...args),
}));
vi.mock('../getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));
vi.mock('../translateGlyphVertices', () => ({
  translateGlyphVertices: (...args: unknown[]): unknown => translateGlyphVerticesMock(...args),
}));
vi.mock('../rotateGlyphVertices', () => ({
  rotateGlyphVertices: (...args: unknown[]): unknown => rotateGlyphVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
// the plain flat-color program/buffer — deliberately distinct objects from imageContext's own
// image-shader program/buffer, so a test would fail if the rect ever got drawn with the wrong one
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = { buffer: {}, cache: new Map(), msdfBuffer: {}, msdfProgram: {}, program: {} } as unknown as TImageRenderContext;
const UP = { x: 0, y: -1 };

describe('drawValueLabel', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
    drawMsdfGlyphsMock.mockClear();
    getMsdfAtlasTextureMock.mockClear().mockReturnValue({});
    buildGlyphQuadsMock.mockClear().mockReturnValue([]);
    // a single glyph spanning x:[-6,6], y:[-9,9] around its own local origin
    getGlyphQuadBoundsMock.mockClear().mockReturnValue({ maxX: 6, maxY: 9, minX: -6, minY: -9 });
    translateGlyphVerticesMock.mockClear().mockReturnValue(new Float32Array());
    rotateGlyphVerticesMock.mockClear().mockImplementation((vertices: Float32Array) => vertices);
  });

  it('should draw a pink rounded-rect badge, using the plain flat-color program/buffer (not the image-shader ones from imageContext), sized to the glyphs’ measured bounds plus padding, centered along the offset direction from the anchor', () => {
    // before — 28px above the anchor at zoom 1; glyph bounds are 12 wide x 18 tall, padding 5x/3y
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { cornerRadius: 3, fill: '#ff2fc2', height: 24, width: 22, x: 100 - 11, y: 72 - 12 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should follow a sideways offset direction just as well, staying on the same axis as the anchor', () => {
    // before — offset 28px to the right instead of up
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, { x: 1, y: 0 }, 200, 150, IDENTITY_VIEWPORT);

    // result — badge center is (128, 100), not (100, 72)
    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.x + rect.width / 2).toBeCloseTo(128, 5);
    expect(rect.y + rect.height / 2).toBeCloseTo(100, 5);
  });

  it('should translate the raw glyph vertices so their bounds center lands exactly on the badge center', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result — glyph bounds center is (0,0) locally, badge center is (100, 72)
    expect(translateGlyphVerticesMock).toHaveBeenCalledWith(expect.any(Float32Array), 100, 72);
  });

  it('should draw the glyph quads in white on top of the badge, using imageContext’s msdf program/buffer', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawMsdfGlyphsMock).toHaveBeenCalledWith(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTextureMock.mock.results[0].value,
      expect.anything(),
      translateGlyphVerticesMock.mock.results[0].value,
      '#ffffff',
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should shrink the badge and its offset together as the viewport zooms in, keeping constant screen size', () => {
    // before — zoomed in 2x: everything screen-pixel-sized gets halved in world units
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result — offset is 14 world-units above the anchor (28 screen px / 2)
    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.y + rect.height / 2).toBeCloseTo(86, 5);
  });

  it('should draw nothing when the text produces no glyphs', () => {
    // mock — e.g. an empty string
    getGlyphQuadBoundsMock.mockReturnValue(null);

    // before
    drawValueLabel(gl, program, buffer, imageContext, '', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
    expect(drawMsdfGlyphsMock).not.toHaveBeenCalled();
  });

  it('should paint the badge in the caller-supplied fill colour instead of the default pink', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      fill: '#337ae1',
    });

    // result
    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.fill).toBe('#337ae1');
  });

  it('should rotate the badge and its glyphs by the given angle, spinning the text around the badge centre', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      angleDeg: 30,
    });

    // result — the rect gets the angle as its rotation argument
    expect(drawRectMock.mock.calls[0][7]).toBe(30);

    // result — the glyphs are rotated around the badge centre (100, 72) by the same angle
    expect(rotateGlyphVerticesMock).toHaveBeenCalledWith(translateGlyphVerticesMock.mock.results[0].value, { x: 100, y: 72 }, 30);
    expect(drawMsdfGlyphsMock.mock.calls[0][5]).toBe(rotateGlyphVerticesMock.mock.results[0].value);
  });

  it('should sit the badge a fixed screen-px gap off the edge when edgeGapPx is given, not the default centre offset', () => {
    // before — glyph bounds 18 tall + 3px padding each side => 24px badge, so a 5px edge gap puts the centre 17px out
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      edgeGapPx: 5,
    });

    // result
    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.y + rect.height / 2).toBeCloseTo(83, 5);
  });
});
