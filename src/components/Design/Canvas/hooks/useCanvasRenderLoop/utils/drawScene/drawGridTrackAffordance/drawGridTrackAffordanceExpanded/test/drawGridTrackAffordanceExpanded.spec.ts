// types
import { TDrawSceneContext } from '../../../types';

// utils
import { drawGridTrackAffordanceExpanded } from '../drawGridTrackAffordanceExpanded';

const buildGlyphQuadsMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();
const getGridTrackAffordanceExpandedGeometryMock = vi.fn();
const drawRectMock = vi.fn();
const drawGridTrackAffordanceGripMock = vi.fn();
const drawValueLabelTextMock = vi.fn();
const drawGridTrackAffordanceChevronMock = vi.fn();

vi.mock('utils/canvas/text/buildGlyphQuads', () => ({
  buildGlyphQuads: (...args: unknown[]): unknown => buildGlyphQuadsMock(...args),
}));
vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));
vi.mock('../getGridTrackAffordanceExpandedGeometry', () => ({
  getGridTrackAffordanceExpandedGeometry: (...args: unknown[]): unknown => getGridTrackAffordanceExpandedGeometryMock(...args),
}));
vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));
vi.mock('../drawGridTrackAffordanceGrip', () => ({
  drawGridTrackAffordanceGrip: (...args: unknown[]): void => drawGridTrackAffordanceGripMock(...args),
}));
vi.mock('utils/canvas/text/drawValueLabel/drawValueLabelText', () => ({
  drawValueLabelText: (...args: unknown[]): void => drawValueLabelTextMock(...args),
}));
vi.mock('../drawGridTrackAffordanceChevron', () => ({
  drawGridTrackAffordanceChevron: (...args: unknown[]): void => drawGridTrackAffordanceChevronMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

const CENTER = { x: 50, y: -40 };
const BOUNDS = { maxX: 10, maxY: 5, minX: -10, minY: -5 };
const GEOMETRY = {
  badgeHeight: 20,
  badgeWidth: 56,
  chevronCenter: { x: 70, y: -40 },
  gripCenter: { x: 25, y: -40 },
  textCenter: { x: 50, y: -40 },
};

describe('drawGridTrackAffordanceExpanded', () => {
  beforeEach(() => {
    buildGlyphQuadsMock.mockClear().mockReturnValue([]);
    getGlyphQuadBoundsMock.mockClear().mockReturnValue(BOUNDS);
    getGridTrackAffordanceExpandedGeometryMock.mockClear().mockReturnValue(GEOMETRY);
    drawRectMock.mockClear();
    drawGridTrackAffordanceGripMock.mockClear();
    drawValueLabelTextMock.mockClear();
    drawGridTrackAffordanceChevronMock.mockClear();
  });

  it('should draw nothing when the text produces no glyphs', () => {
    getGlyphQuadBoundsMock.mockReturnValue(null);

    drawGridTrackAffordanceExpanded(context, CENTER, 'column', '1fr', 0, { x: 0, y: 0 });

    expect(drawRectMock).not.toHaveBeenCalled();
    expect(drawGridTrackAffordanceGripMock).not.toHaveBeenCalled();
    expect(drawValueLabelTextMock).not.toHaveBeenCalled();
    expect(drawGridTrackAffordanceChevronMock).not.toHaveBeenCalled();
  });

  it('should draw the rounded badge background centered on the given point, using the label colors', () => {
    drawGridTrackAffordanceExpanded(context, CENTER, 'column', '1fr', 0, { x: 0, y: 0 });

    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.fill).toBe('#0c8ce9');
    expect(rect.width).toBe(GEOMETRY.badgeWidth);
    expect(rect.height).toBe(GEOMETRY.badgeHeight);
    expect(rect.x).toBe(CENTER.x - GEOMETRY.badgeWidth / 2);
    expect(rect.y).toBe(CENTER.y - GEOMETRY.badgeHeight / 2);
  });

  it('should draw the grip at its geometry center, using the given axis', () => {
    drawGridTrackAffordanceExpanded(context, CENTER, 'row', '1fr', 0, { x: 0, y: 0 });

    expect(drawGridTrackAffordanceGripMock).toHaveBeenCalledWith(context, GEOMETRY.gripCenter, 'row', 0, { x: 0, y: 0 });
  });

  it('should draw the value text and the chevron at their own geometry centers', () => {
    drawGridTrackAffordanceExpanded(context, CENTER, 'column', '1fr', 0, { x: 0, y: 0 });

    expect(drawValueLabelTextMock).toHaveBeenCalledWith(
      context.gl,
      context.imageContext,
      expect.any(Float32Array),
      BOUNDS,
      GEOMETRY.textCenter,
      0,
      11,
      100,
      100,
      context.viewport,
    );
    expect(drawGridTrackAffordanceChevronMock).toHaveBeenCalledWith(context, GEOMETRY.chevronCenter, 0, { x: 0, y: 0 });
  });
});
