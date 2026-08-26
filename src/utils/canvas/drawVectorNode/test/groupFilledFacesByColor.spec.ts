// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { groupFilledFacesByColor } from '../groupFilledFacesByColor';

const getVectorFillLoopPointsMock = vi.fn();
const getVectorFillColorForLoopKeyMock = vi.fn();

vi.mock('../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));
vi.mock('../../vectorNetwork/getVectorFillColorForLoopKey', () => ({
  getVectorFillColorForLoopKey: (...args: unknown[]): unknown => getVectorFillColorForLoopKeyMock(...args),
}));

const baseNode: TVectorNode = {
  fillColor: '#ff0000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#00ff00',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('groupFilledFacesByColor', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockClear();
    getVectorFillColorForLoopKeyMock.mockClear();
  });

  it('should return an empty map when the node has no filled faces', () => {
    // before
    const result = groupFilledFacesByColor(baseNode);

    // result
    expect(getVectorFillLoopPointsMock).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });

  it('should group resolved loop points under their loop key’s own color', () => {
    // mock
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['s1,s2,s3'] };
    const points = [{ x: 0, y: 0 }];

    getVectorFillLoopPointsMock.mockReturnValue(points);
    getVectorFillColorForLoopKeyMock.mockReturnValue('#123456');

    // before
    const result = groupFilledFacesByColor(node);

    // result
    expect(getVectorFillLoopPointsMock).toHaveBeenCalledWith(node, 's1,s2,s3');
    expect(getVectorFillColorForLoopKeyMock).toHaveBeenCalledWith('s1,s2,s3');
    expect(result.get('#123456')).toEqual([points]);
  });

  it('should push a second loop’s points onto the same color’s array when two loop keys resolve to the same color', () => {
    // mock
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['s1,s2,s3', 's4,s5,s6'] };
    const pointsA = [{ x: 0, y: 0 }];
    const pointsB = [{ x: 1, y: 1 }];

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => (key === 's1,s2,s3' ? pointsA : pointsB));
    getVectorFillColorForLoopKeyMock.mockReturnValue('#123456');

    // before
    const result = groupFilledFacesByColor(node);

    // result
    expect(result.size).toBe(1);
    expect(result.get('#123456')).toEqual([pointsA, pointsB]);
  });

  it('should group distinct colors under separate entries', () => {
    // mock
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['s1,s2,s3', 's4,s5,s6'] };
    const pointsA = [{ x: 0, y: 0 }];
    const pointsB = [{ x: 1, y: 1 }];

    getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => (key === 's1,s2,s3' ? pointsA : pointsB));
    getVectorFillColorForLoopKeyMock.mockImplementation((key: string) => (key === 's1,s2,s3' ? '#111111' : '#222222'));

    // before
    const result = groupFilledFacesByColor(node);

    // result
    expect(result.size).toBe(2);
    expect(result.get('#111111')).toEqual([pointsA]);
    expect(result.get('#222222')).toEqual([pointsB]);
  });

  it('should skip a loop key that no longer resolves to any points', () => {
    // mock
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['stale-key'] };

    getVectorFillLoopPointsMock.mockReturnValue(null);

    // before
    const result = groupFilledFacesByColor(node);

    // result
    expect(getVectorFillColorForLoopKeyMock).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });
});
