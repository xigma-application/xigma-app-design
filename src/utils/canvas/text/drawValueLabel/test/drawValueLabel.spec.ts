// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

// utils
import { drawValueLabel } from '../drawValueLabel';

const buildGlyphQuadsMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();
const getValueLabelBadgeGeometryMock = vi.fn();
const drawValueLabelBorderMock = vi.fn();
const drawValueLabelBadgeMock = vi.fn();
const drawValueLabelTextMock = vi.fn();

vi.mock('../../buildGlyphQuads', () => ({
  buildGlyphQuads: (...args: unknown[]): unknown => buildGlyphQuadsMock(...args),
}));
vi.mock('../../getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));
vi.mock('../getValueLabelBadgeGeometry', () => ({
  getValueLabelBadgeGeometry: (...args: unknown[]): unknown => getValueLabelBadgeGeometryMock(...args),
}));
vi.mock('../drawValueLabelBorder', () => ({
  drawValueLabelBorder: (...args: unknown[]): void => drawValueLabelBorderMock(...args),
}));
vi.mock('../drawValueLabelBadge', () => ({
  drawValueLabelBadge: (...args: unknown[]): void => drawValueLabelBadgeMock(...args),
}));
vi.mock('../drawValueLabelText', () => ({
  drawValueLabelText: (...args: unknown[]): void => drawValueLabelTextMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as TImageRenderContext;
const UP = { x: 0, y: -1 };
const BOUNDS = { maxX: 6, maxY: 9, minX: -6, minY: -9 };
const GEOMETRY = { badgeHeight: 24, badgeWidth: 22, center: { x: 100, y: 72 } };

describe('drawValueLabel', () => {
  beforeEach(() => {
    buildGlyphQuadsMock.mockClear().mockReturnValue([]);
    getGlyphQuadBoundsMock.mockClear().mockReturnValue(BOUNDS);
    getValueLabelBadgeGeometryMock.mockClear().mockReturnValue(GEOMETRY);
    drawValueLabelBorderMock.mockClear();
    drawValueLabelBadgeMock.mockClear();
    drawValueLabelTextMock.mockClear();
  });

  it('should measure the requested text at a zoom-scaled font size, then derive the badge geometry from its bounds', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(buildGlyphQuadsMock).toHaveBeenCalledWith(expect.anything(), ['7'], 11, 0, 0);
    expect(getGlyphQuadBoundsMock).toHaveBeenCalledWith(expect.any(Float32Array));
    expect(getValueLabelBadgeGeometryMock).toHaveBeenCalledWith(BOUNDS, { x: 100, y: 100 }, UP, 5, 3, 28, undefined, 1);
  });

  it('should draw the badge and the text at the geometry’s center, but not a hover border by default', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawValueLabelBorderMock).not.toHaveBeenCalled();
    expect(drawValueLabelBadgeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      GEOMETRY.center,
      GEOMETRY.badgeWidth,
      GEOMETRY.badgeHeight,
      '#ff2fc2',
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawValueLabelTextMock).toHaveBeenCalledWith(
      gl,
      imageContext,
      expect.any(Float32Array),
      BOUNDS,
      GEOMETRY.center,
      0,
      11,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw a hover border before the badge when isHovered is set', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      isHovered: true,
    });

    // result
    expect(drawValueLabelBorderMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      GEOMETRY.center,
      GEOMETRY.badgeWidth,
      GEOMETRY.badgeHeight,
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawValueLabelBorderMock.mock.invocationCallOrder[0]).toBeLessThan(drawValueLabelBadgeMock.mock.invocationCallOrder[0]);
  });

  it('should draw nothing when the text produces no glyphs', () => {
    // mock — e.g. an empty string
    getGlyphQuadBoundsMock.mockReturnValue(null);

    // before
    drawValueLabel(gl, program, buffer, imageContext, '', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getValueLabelBadgeGeometryMock).not.toHaveBeenCalled();
    expect(drawValueLabelBadgeMock).not.toHaveBeenCalled();
    expect(drawValueLabelTextMock).not.toHaveBeenCalled();
  });

  it('should paint the badge in the caller-supplied fill colour instead of the default pink', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      fill: '#337ae1',
    });

    // result
    expect(drawValueLabelBadgeMock.mock.calls[0][6]).toBe('#337ae1');
  });

  it('should rotate the badge and its glyphs by the given angle', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      angleDeg: 30,
    });

    // result
    expect(drawValueLabelBadgeMock.mock.calls[0][10]).toBe(30);
    expect(drawValueLabelTextMock.mock.calls[0][5]).toBe(30);
  });

  it('should forward a caller-supplied edge gap to the geometry helper instead of the default offset', () => {
    // before
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, IDENTITY_VIEWPORT, {
      edgeGapPx: 5,
    });

    // result
    expect(getValueLabelBadgeGeometryMock).toHaveBeenCalledWith(BOUNDS, { x: 100, y: 100 }, UP, 5, 3, 28, 5, 1);
  });

  it('should shrink the font size and paddings passed to the measuring/geometry steps as the viewport zooms in', () => {
    // before — zoomed in 2x: everything screen-pixel-sized halves in world units
    drawValueLabel(gl, program, buffer, imageContext, '7', { x: 100, y: 100 }, UP, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    expect(buildGlyphQuadsMock).toHaveBeenCalledWith(expect.anything(), ['7'], 5.5, 0, 0);
    expect(getValueLabelBadgeGeometryMock).toHaveBeenCalledWith(BOUNDS, { x: 100, y: 100 }, UP, 2.5, 1.5, 14, undefined, 2);
  });
});
