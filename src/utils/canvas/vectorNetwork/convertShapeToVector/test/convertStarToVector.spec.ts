// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { convertStarToVector } from '../convertStarToVector';

const buildStar = (overrides: Partial<TStarNode> = {}): TStarNode => ({
  fill: '#654321',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star 1',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('convertStarToVector', () => {
  it('should convert a sharp-cornered star into a closed loop with two vertices per point', () => {
    // mock
    const node = buildStar({ points: 5 });

    // action
    const result = convertStarToVector(node);

    // result
    expect(result.type).toBe(NodeType.vector);
    expect(result.id).toBe('star-1');
    expect(result.defaultFill).toEqual([{ color: '#654321', opacity: 100, type: 'solid' }]);
    expect(Object.keys(result.vertices)).toHaveLength(10);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(result.fillByKey?.[result.filledFaceKeys[0]]).toEqual([{ color: '#654321', opacity: 100, type: 'solid' }]);
  });

  it('should round every corner into a curve when cornerRadius is set', () => {
    // mock
    const node = buildStar({ cornerRadius: 2, points: 5 });

    // action
    const result = convertStarToVector(node);

    // result — every one of the 10 sharp tips is replaced by at least one curved segment
    expect(Object.keys(result.vertices).length).toBeGreaterThan(10);
    expect(Object.values(result.segments).filter((segment) => segment.tangentStart !== null).length).toBeGreaterThanOrEqual(10);
  });

  it('should bake flipY into the vertex coordinates, flipping the top tip toward the bottom', () => {
    // mock
    const unflipped = buildStar();
    const flipped = buildStar({ flipY: true });

    // action
    const unflippedResult = convertStarToVector(unflipped);
    const flippedResult = convertStarToVector(flipped);

    // result
    const minY = (node: typeof unflippedResult): number => Math.min(...Object.values(node.vertices).map((vertex) => vertex.y));

    expect(minY(unflippedResult)).toBeLessThan(minY(flippedResult));
  });
});
