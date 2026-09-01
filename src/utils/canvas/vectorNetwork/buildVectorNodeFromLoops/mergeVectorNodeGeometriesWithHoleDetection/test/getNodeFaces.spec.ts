// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

const getVectorFillLoopPointsMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));

// utils
import { getNodeFaces } from '../getNodeFaces';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];
const reversed = (points: TPoint[]): TPoint[] => [...points].reverse();

const buildNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  fillColor: '#123456',
  fillColorOverrideByKey: {},
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Contour',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#123456',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getNodeFaces', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockReset();
  });

  it('should resolve each node’s own filled face keys into a face with its bounds and winding sign', () => {
    const node = buildNode({ filledFaceKeys: ['a'] });

    getVectorFillLoopPointsMock.mockReturnValue(square(0, 0, 10));

    expect(getNodeFaces([node])).toEqual([{ bounds: [0, 0, 10, 10], key: 'a', points: square(0, 0, 10), sign: 1 }]);
  });

  it('should give an opposite-wound loop a negative sign', () => {
    const node = buildNode({ filledFaceKeys: ['a'] });

    getVectorFillLoopPointsMock.mockReturnValue(reversed(square(0, 0, 10)));

    expect(getNodeFaces([node])[0].sign).toBe(-1);
  });

  it('should skip a key that no longer resolves to any points', () => {
    const node = buildNode({ filledFaceKeys: ['ghost'] });

    getVectorFillLoopPointsMock.mockReturnValue(null);

    expect(getNodeFaces([node])).toEqual([]);
  });

  it('should flatten faces across every node given', () => {
    const nodeA = buildNode({ filledFaceKeys: ['a'], id: 'a-node' });
    const nodeB = buildNode({ filledFaceKeys: ['b'], id: 'b-node' });

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => (key === 'a' ? square(0, 0, 10) : square(100, 100, 10)));

    expect(getNodeFaces([nodeA, nodeB]).map((face) => face.key)).toEqual(['a', 'b']);
  });
});
