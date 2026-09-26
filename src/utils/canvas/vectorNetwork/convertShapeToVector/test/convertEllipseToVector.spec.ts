// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { convertEllipseToVector } from '../convertEllipseToVector';

const buildEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
  height: 80,
  id: 'ellipse-1',
  name: 'Ellipse 1',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 60,
  x: 0,
  y: 0,
  ...overrides,
});

describe('convertEllipseToVector', () => {
  it('should convert a full ellipse into an exact 4-vertex bezier loop', () => {
    // mock
    const node = buildEllipse();

    // action
    const result = convertEllipseToVector(node);

    // result
    expect(result.type).toBe(NodeType.vector);
    expect(result.id).toBe('ellipse-1');
    expect(result.defaultFill).toEqual([{ color: '#0000ff', opacity: 100, type: 'solid' }]);
    expect(Object.keys(result.vertices)).toHaveLength(4);
    expect(Object.values(result.segments).every((segment) => segment.tangentStart !== null)).toBe(true);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.fillByKey?.[result.filledFaceKeys[0]]).toEqual([{ color: '#0000ff', opacity: 100, type: 'solid' }]);
  });

  it('should fall back to a straight-segment polyline when an arc cut is active', () => {
    // mock
    const node = buildEllipse({ arcEndAngle: 180, arcStartAngle: 0 });

    // action
    const result = convertEllipseToVector(node);

    // result
    expect(Object.keys(result.vertices).length).toBeGreaterThan(4);
    expect(Object.values(result.segments).every((segment) => segment.tangentStart === null)).toBe(true);
  });

  it('should fall back to a straight-segment polyline (ring) when arcRatio creates a hole with no angular cut', () => {
    // mock
    const node = buildEllipse({ arcRatio: 0.5 });

    // action
    const result = convertEllipseToVector(node);

    // result
    expect(Object.keys(result.vertices).length).toBeGreaterThan(4);
    expect(Object.values(result.segments).every((segment) => segment.tangentStart === null)).toBe(true);
  });

  it('should keep the rounded corners of a cut arc in the polyline', () => {
    // mock
    const sharp = convertEllipseToVector(buildEllipse({ arcEndAngle: 180, arcStartAngle: 90 }));
    const rounded = convertEllipseToVector(buildEllipse({ arcEndAngle: 180, arcStartAngle: 90, cornerRadius: 10 }));

    // result
    expect(Object.keys(rounded.vertices).length).toBeGreaterThan(Object.keys(sharp.vertices).length);
  });

  it('should keep the fill paints on the vector and leave the stroke color empty without a solid fill', () => {
    // mock
    const fills = [{ opacity: 100, stops: [], type: 'gradient-linear' }] as unknown as TEllipseNode['fills'];

    // action
    const result = convertEllipseToVector(buildEllipse({ fills }));

    // result
    expect(result.defaultFill).toBe(fills);
    expect(result.strokes).toEqual([]);
  });

  it('should keep the stroke with its position on the vector', () => {
    // mock
    const node = buildEllipse({
      strokeAlign: StrokeAlign.outside,
      strokeWidth: 6,
      strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });

    // action
    const result = convertEllipseToVector(node);

    // result
    expect(result).toMatchObject({ strokeAlign: StrokeAlign.outside, strokeWidth: 6, strokes: [expect.objectContaining({ color: '#ff0000' })] });
  });
});
