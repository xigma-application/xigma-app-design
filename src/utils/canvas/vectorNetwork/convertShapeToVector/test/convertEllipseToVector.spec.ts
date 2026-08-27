// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { convertEllipseToVector } from '../convertEllipseToVector';

const buildEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#0000ff',
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
    expect(result.fillColor).toBe('#0000ff');
    expect(Object.keys(result.vertices)).toHaveLength(4);
    expect(Object.values(result.segments).every((segment) => segment.tangentStart !== null)).toBe(true);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.fillColorOverrideByKey?.[result.filledFaceKeys[0]]).toBe('#0000ff');
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
});
