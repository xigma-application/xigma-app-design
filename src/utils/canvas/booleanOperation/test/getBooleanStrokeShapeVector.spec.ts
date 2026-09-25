// types
import { TLineNode } from 'types/design/types';

// utils
import { getBooleanStrokeShapeVector } from '../getBooleanStrokeShapeVector';

const outlineMock = vi.fn();

vi.mock('../../vectorNetwork/getNodeStrokeOutline/getNodeStrokeOutline', () => ({
  getNodeStrokeOutline: (...args: unknown[]): unknown => outlineMock(...args),
}));
vi.mock('../../render/getRenderedVectorNode', () => ({ getRenderedVectorNode: (node: object): object => ({ rendered: node }) }));

describe('getBooleanStrokeShapeVector', () => {
  it('should turn the stroke outline into a rendered vector, computed once per node', () => {
    // mock
    const line = { id: 'line' } as TLineNode;
    outlineMock.mockReturnValue('outline');

    // before
    const first = getBooleanStrokeShapeVector(line);
    const second = getBooleanStrokeShapeVector(line);

    // result
    expect(first).toEqual({ rendered: 'outline' });
    expect(second).toBe(first);
    expect(outlineMock).toHaveBeenCalledTimes(1);
  });

  it('should return nothing when the node has no stroke outline', () => {
    // mock
    outlineMock.mockReturnValue(null);

    // result
    expect(getBooleanStrokeShapeVector({ id: 'empty' } as TLineNode)).toBeNull();
  });
});
