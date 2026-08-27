// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { convertRectangleToVector } from '../convertRectangleToVector';

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#00ff00',
  height: 40,
  id: 'rect-1',
  name: 'Rectangle 1',
  parentId: 'frame-1',
  rotation: 15,
  type: NodeType.rectangle,
  width: 40,
  x: 10,
  y: 20,
  ...overrides,
});

describe('convertRectangleToVector', () => {
  it('should convert a sharp-cornered rectangle into a 4-vertex closed vector loop', () => {
    // mock
    const node = buildRectangle();

    // action
    const result = convertRectangleToVector(node);

    // result
    expect(result.type).toBe(NodeType.vector);
    expect(result.id).toBe('rect-1');
    expect(result.name).toBe('Rectangle 1');
    expect(result.parentId).toBe('frame-1');
    expect(result.rotation).toBe(15);
    expect(result.fillColor).toBe('#00ff00');
    expect(result.strokeWidth).toBe(0);
    expect(Object.keys(result.vertices)).toHaveLength(4);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.fillColorOverrideByKey?.[result.filledFaceKeys[0]]).toBe('#00ff00');
  });

  it('should round every corner into a curve when cornerRadius is set', () => {
    // mock
    const node = buildRectangle({ cornerRadius: 8 });

    // action
    const result = convertRectangleToVector(node);

    // result
    expect(Object.keys(result.vertices)).toHaveLength(8);
    expect(Object.values(result.segments).some((segment) => segment.tangentStart !== null)).toBe(true);
  });

  it('should clamp an oversized cornerRadius to the shape max, keeping the rounded loop inside the original bounds', () => {
    // mock
    const node = buildRectangle({ cornerRadius: 1000, x: 0, y: 0 });

    // action
    const result = convertRectangleToVector(node);

    // result
    Object.values(result.vertices).forEach((vertex) => {
      expect(vertex.x).toBeGreaterThanOrEqual(-0.01);
      expect(vertex.x).toBeLessThanOrEqual(40.01);
      expect(vertex.y).toBeGreaterThanOrEqual(-0.01);
      expect(vertex.y).toBeLessThanOrEqual(40.01);
    });
  });
});
