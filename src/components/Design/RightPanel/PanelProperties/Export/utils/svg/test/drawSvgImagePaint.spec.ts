// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { drawSvgImagePaint } from '../drawSvgImagePaint';

const loadSvgImageAssetMock = vi.fn();
const drawSvgPolygonsMock = vi.fn();
const getSvgImageClipPathDefMock = vi.fn();
const getSvgImagePatternDefMock = vi.fn();
const getSvgImagePlacementMock = vi.fn();
const getSvgRotateTransformValueMock = vi.fn();
const registerSvgDefMock = vi.fn();

vi.mock('../loadSvgImageAsset', () => ({ loadSvgImageAsset: (...args: unknown[]): unknown => loadSvgImageAssetMock(...args) }));
vi.mock('../drawSvgPolygons', () => ({ drawSvgPolygons: (...args: unknown[]): void => drawSvgPolygonsMock(...args) }));
vi.mock('../getSvgImageClipPathDef', () => ({
  getSvgImageClipPathDef: (...args: unknown[]): unknown => getSvgImageClipPathDefMock(...args),
}));
vi.mock('../getSvgImagePatternDef', () => ({
  getSvgImagePatternDef: (...args: unknown[]): unknown => getSvgImagePatternDefMock(...args),
}));
vi.mock('../getSvgImagePlacement', () => ({ getSvgImagePlacement: (...args: unknown[]): unknown => getSvgImagePlacementMock(...args) }));
vi.mock('../getSvgRotateTransformValue', () => ({
  getSvgRotateTransformValue: (...args: unknown[]): unknown => getSvgRotateTransformValueMock(...args),
}));
vi.mock('../registerSvgDef', () => ({
  registerSvgDef: (defs: string[], prefix: string, buildDef: (id: string) => string): string => {
    registerSvgDefMock(defs, prefix, buildDef);

    return `${prefix}0`;
  },
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const boxGeometry = { rect: { height: 30, width: 40, x: 5, y: 5 }, rotation: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];

const paint = (overrides: Partial<TImagePaint> = {}): TImagePaint => ({
  flipX: false,
  flipY: false,
  opacity: 100,
  ref: 'i',
  rotation: 0,
  scaleMode: 'fill',
  ...overrides,
  type: 'image',
});

describe('drawSvgImagePaint', () => {
  beforeEach(() => {
    loadSvgImageAssetMock.mockReset();
    drawSvgPolygonsMock.mockClear();
    getSvgImageClipPathDefMock.mockReset();
    getSvgImagePatternDefMock.mockReset();
    getSvgImagePlacementMock.mockReset();
    getSvgRotateTransformValueMock.mockReset();
    registerSvgDefMock.mockClear();
  });

  it('should draw nothing when the asset fails to load', async () => {
    loadSvgImageAssetMock.mockResolvedValue(null);

    const elements: string[] = [];

    await drawSvgImagePaint(elements, [], paint(), polygons, 1, bounds, boxGeometry);

    expect(elements).toEqual([]);
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should load the asset with the paint ref/rotation/flip', async () => {
    loadSvgImageAssetMock.mockResolvedValue(null);
    getSvgImagePlacementMock.mockReturnValue({ preserveAspectRatio: 'xMidYMid slice', rect: boxGeometry.rect, rotation: 0 });

    await drawSvgImagePaint([], [], paint({ flipX: true, flipY: true, ref: 'r', rotation: 180 }), polygons, 1, bounds, boxGeometry);

    expect(loadSvgImageAssetMock).toHaveBeenCalledWith('r', 180, true, true);
  });

  it('should draw a placed quad clipped to the shape for a fill/fit/crop paint', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 20, width: 40 });
    getSvgImagePlacementMock.mockReturnValue({ preserveAspectRatio: 'xMidYMid slice', rect: boxGeometry.rect, rotation: 0 });
    getSvgRotateTransformValueMock.mockReturnValue('');

    const elements: string[] = [];
    const defs: string[] = [];

    await drawSvgImagePaint(elements, defs, paint({ scaleMode: 'fill' }), polygons, 0.5, bounds, boxGeometry);

    expect(getSvgImagePlacementMock).toHaveBeenCalledWith(paint({ scaleMode: 'fill' }), boxGeometry.rect, boxGeometry.rotation);
    expect(registerSvgDefMock).toHaveBeenCalledWith(defs, 'XigmaClip', expect.any(Function));
    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('<image href="data:image/png;base64,AAAA"');
    expect(elements[0]).toContain('x="5" y="5" width="40" height="30"');
    expect(elements[0]).toContain('preserveAspectRatio="xMidYMid slice"');
    expect(elements[0]).toContain('clip-path="url(#XigmaClip0)"');
    expect(elements[0]).toContain('opacity="0.5"');
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should omit the transform attribute when the rotation value is empty and the opacity attribute at full opacity', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 20, width: 40 });
    getSvgImagePlacementMock.mockReturnValue({ preserveAspectRatio: 'xMidYMid meet', rect: boxGeometry.rect, rotation: 0 });
    getSvgRotateTransformValueMock.mockReturnValue('');

    const elements: string[] = [];

    await drawSvgImagePaint(elements, [], paint(), polygons, 1, bounds, boxGeometry);

    expect(elements[0]).not.toContain('transform=');
    expect(elements[0]).not.toContain('opacity="');
  });

  it('should add a rotate transform when the placement rotation is non-zero', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 20, width: 40 });
    getSvgImagePlacementMock.mockReturnValue({ preserveAspectRatio: 'none', rect: boxGeometry.rect, rotation: 30 });
    getSvgRotateTransformValueMock.mockReturnValue('rotate(30 25 20)');

    const elements: string[] = [];

    await drawSvgImagePaint(elements, [], paint(), polygons, 1, bounds, boxGeometry);

    expect(getSvgRotateTransformValueMock).toHaveBeenCalledWith(30, boxGeometry.rect, bounds);
    expect(elements[0]).toContain('transform="rotate(30 25 20)"');
  });

  it('should register a userSpaceOnUse pattern and fill the shape polygon with it for tile mode', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 200, width: 100 });
    getSvgRotateTransformValueMock.mockReturnValue('');

    const elements: string[] = [];
    const defs: string[] = [];

    await drawSvgImagePaint(elements, defs, paint({ scale: 0.25, scaleMode: 'tile' }), polygons, 0.5, bounds, boxGeometry);

    expect(getSvgImagePlacementMock).not.toHaveBeenCalled();
    expect(registerSvgDefMock).toHaveBeenCalledWith(defs, 'XigmaPattern', expect.any(Function));
    expect(getSvgRotateTransformValueMock).toHaveBeenCalledWith(boxGeometry.rotation, boxGeometry.rect, bounds);
    expect(drawSvgPolygonsMock).toHaveBeenCalledWith(elements, polygons, 'url(#XigmaPattern0)', 0.5, bounds);
  });

  it('should size the tile to the asset dimensions times the paint scale, defaulting the scale when unset', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 200, width: 100 });
    getSvgRotateTransformValueMock.mockReturnValue('');

    await drawSvgImagePaint([], [], paint({ scaleMode: 'tile' }), polygons, 1, bounds, boxGeometry);

    const buildDef = registerSvgDefMock.mock.calls[0][2] as (id: string) => string;

    buildDef('XigmaPattern0');

    expect(getSvgImagePatternDefMock).toHaveBeenCalledWith('XigmaPattern0', 'data:image/png;base64,AAAA', 50, 100, '');
  });

  it('should let a crop win over tile mode, drawing a placed quad instead of a pattern', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 20, width: 40 });
    getSvgImagePlacementMock.mockReturnValue({ preserveAspectRatio: 'none', rect: { height: 8, width: 8, x: 1, y: 1 }, rotation: 0 });
    getSvgRotateTransformValueMock.mockReturnValue('');

    const elements: string[] = [];

    await drawSvgImagePaint(
      elements,
      [],
      paint({ crop: { height: 8, rotation: 0, width: 8, x: 1, y: 1 }, scaleMode: 'tile' }),
      polygons,
      1,
      bounds,
      boxGeometry,
    );

    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
    expect(elements[0]).toContain('<image');
  });
});
