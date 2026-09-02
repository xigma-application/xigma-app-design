// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getContainingFilledLoopKey } from '../getContainingFilledLoopKey';

const getVectorFillLoopPointsMock = vi.fn();

vi.mock('../getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

const baseNode: TVectorNode = {
  defaultFill: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('getContainingFilledLoopKey', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockReset();
  });

  it('should return the filled loop key whose polygon contains the given face', () => {
    // mock — A is a big filled square, B (the face being tested) is a small square nested inside it
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['A'] };

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => (key === 'A' ? square(0, 0, 100) : null));

    // result
    expect(getContainingFilledLoopKey(node, square(10, 10, 10))).toBe('A');
  });

  it('should return null when no filled loop contains the face', () => {
    // mock — A sits entirely elsewhere, not overlapping the tested face
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['A'] };

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => (key === 'A' ? square(200, 200, 100) : null));

    // result
    expect(getContainingFilledLoopKey(node, square(10, 10, 10))).toBeNull();
  });

  it('should pick the smallest (immediate) ancestor when the face is nested several levels deep', () => {
    // mock — A is a large filled square, D is a medium filled square nested inside A, B is nested inside D
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['A', 'D'] };

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => {
      if (key === 'A') {
        return square(0, 0, 100);
      }
      if (key === 'D') {
        return square(10, 10, 50);
      }
      return null;
    });

    // result
    expect(getContainingFilledLoopKey(node, square(20, 20, 10))).toBe('D');
  });

  it('should keep the running-smallest ancestor when a later, larger candidate also contains the face', () => {
    // mock — A is the largest filled square, D is the true (medium) immediate ancestor, E is a third
    // filled square larger than D but still smaller than A — the reduce must not let E replace D
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['A', 'D', 'E'] };

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => {
      if (key === 'A') {
        return square(0, 0, 100);
      }
      if (key === 'D') {
        return square(10, 10, 50);
      }
      if (key === 'E') {
        return square(0, 0, 70);
      }
      return null;
    });

    // result
    expect(getContainingFilledLoopKey(node, square(20, 20, 10))).toBe('D');
  });

  it('should not match a candidate whose area is not strictly larger than the face being tested', () => {
    // mock — a candidate the exact same size/position as the face itself should never count as its parent
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['A'] };
    const points = square(0, 0, 10);

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => (key === 'A' ? points : null));

    // result
    expect(getContainingFilledLoopKey(node, points)).toBeNull();
  });

  it('should skip a filled key that no longer resolves to any points', () => {
    // mock
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['stale'] };

    getVectorFillLoopPointsMock.mockReturnValue(null);

    // result
    expect(getContainingFilledLoopKey(node, square(10, 10, 10))).toBeNull();
  });
});
