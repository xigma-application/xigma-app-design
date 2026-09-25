// utils
import { getVertexCountHandlePositionFromVertices } from '../getVertexCountHandlePositionFromVertices';

vi.mock('utils/canvas/cornerRadius/getCornerRadiusHandleSetbackMultiplier', () => ({
  getCornerRadiusHandleSetbackMultiplier: (): number => 2,
}));

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];
const center = { x: 5, y: 5 };

describe('getVertexCountHandlePositionFromVertices', () => {
  it('should sit on the vertex when the corner is sharp', () => {
    // result
    expect(getVertexCountHandlePositionFromVertices(square, 0, center, 0, 5)).toEqual({ x: 0, y: 0 });
  });

  it('should move along the corner bisector as the corner is rounded, capped by the max radius', () => {
    // before
    const position = getVertexCountHandlePositionFromVertices(square, 0, center, 20, 2);

    // result
    expect(position.x).toBeCloseTo(Math.SQRT2);
    expect(position.y).toBeCloseTo(Math.SQRT2);
  });

  it('should wrap to the last vertex as the previous neighbour and mirror for a flipped shape', () => {
    // before
    const position = getVertexCountHandlePositionFromVertices(square, 0, center, 0, 5, true, true);

    // result
    expect(position).toEqual({ x: 10, y: 10 });
  });
});
