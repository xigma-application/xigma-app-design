// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { convertPolygonToVector } from '../convertPolygonToVector';

const buildPolygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fill: '#123456',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon 1',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('convertPolygonToVector', () => {
  it('should convert a sharp-cornered polygon into a closed loop with one vertex per side', () => {
    // mock
    const node = buildPolygon({ sides: 6 });

    // action
    const result = convertPolygonToVector(node);

    // result
    expect(result.type).toBe(NodeType.vector);
    expect(result.id).toBe('polygon-1');
    expect(result.fillColor).toBe('#123456');
    expect(Object.keys(result.vertices)).toHaveLength(6);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.fillColorOverrideByKey?.[result.filledFaceKeys[0]]).toBe('#123456');
  });

  it('should round every corner into a curve when cornerRadius is set', () => {
    // mock
    const node = buildPolygon({ cornerRadius: 5, sides: 5 });

    // action
    const result = convertPolygonToVector(node);

    // result
    expect(Object.keys(result.vertices)).toHaveLength(10);
  });

  it('should bake flipY into the vertex coordinates, flipping the apex from top to bottom', () => {
    // mock — a triangle apex-up (unflipped) vs. apex-down (flipY)
    const unflipped = buildPolygon({ sides: 3 });
    const flipped = buildPolygon({ flipY: true, sides: 3 });

    // action
    const unflippedResult = convertPolygonToVector(unflipped);
    const flippedResult = convertPolygonToVector(flipped);

    // result
    const minY = (node: typeof unflippedResult): number => Math.min(...Object.values(node.vertices).map((vertex) => vertex.y));
    const maxY = (node: typeof unflippedResult): number => Math.max(...Object.values(node.vertices).map((vertex) => vertex.y));

    expect(minY(unflippedResult)).toBeLessThan(minY(flippedResult));
    expect(maxY(flippedResult)).toBeGreaterThan(maxY(unflippedResult));
  });
});
