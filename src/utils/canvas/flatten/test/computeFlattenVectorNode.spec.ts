// types
import { NodeType } from 'types/design/enums';
import { TNodePaintStyle } from 'store/design/utils/getNodePaintStyle';
import { TVectorNode } from 'types/design/types';

// utils
import { computeFlattenVectorNode } from '../computeFlattenVectorNode';

const filledFaceKeysMock = vi.fn();
const regionsMock = vi.fn();

vi.mock('../../booleanOperation/combineVectorNetworks', () => ({
  combineVectorNetworks: (): unknown => ({ segments: { s: 'segment' }, vertices: { v: 'vertex' } }),
}));
vi.mock('../../vectorNetwork/deriveVectorFaces/deriveVectorFaces', () => ({ deriveVectorFaces: (): string[] => ['faces'] }));
vi.mock('../../booleanOperation/getBooleanFilledFaceKeys', () => ({
  getBooleanFilledFaceKeys: (...args: unknown[]): unknown => filledFaceKeysMock(...args),
}));
vi.mock('../../booleanOperation/getVectorRegionPolygons', () => ({
  getVectorRegionPolygons: (...args: unknown[]): unknown => regionsMock(...args),
}));

const base = { id: 'flat', name: 'Vector', parentId: null };
const filled = { filledFaceKeys: ['a'], id: 'filled' } as unknown as TVectorNode;
const open = { filledFaceKeys: [], id: 'open' } as unknown as TVectorNode;
const fills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('computeFlattenVectorNode', () => {
  beforeEach(() => {
    regionsMock.mockReturnValue([square]);
    filledFaceKeysMock.mockReturnValue(['k1']);
  });

  it('should combine the operands into one vector, filling the faces inside any filled operand', () => {
    // before
    const result = computeFlattenVectorNode(base, [filled, open], { fills } as TNodePaintStyle);
    const isInside = filledFaceKeysMock.mock.calls[0][1];

    // result
    expect(result).toEqual({
      ...base,
      defaultFill: fills,
      fillByKey: { k1: fills },
      filledFaceKeys: ['k1'],
      rotation: 0,
      segments: { s: 'segment' },
      strokeColor: '',
      strokeWidth: 0,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v: 'vertex' },
    });
    expect(regionsMock).toHaveBeenCalledTimes(1);
    expect(isInside({ x: 5, y: 5 })).toBe(true);
    expect(isInside({ x: 50, y: 5 })).toBe(false);
  });

  it('should keep a visible solid stroke with its width, defaulting to 1', () => {
    // mock
    const strokes = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // result
    expect(computeFlattenVectorNode(base, [filled], { fills, strokeWidth: 3, strokes })).toMatchObject({
      strokeColor: '#000000',
      strokeWidth: 3,
    });
    expect(computeFlattenVectorNode(base, [filled], { fills, strokes })).toMatchObject({ strokeWidth: 1 });
  });
});
