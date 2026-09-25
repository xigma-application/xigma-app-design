// types
import { TVectorNode } from 'types/design/types';

// utils
import { combineVectorNetworks } from '../combineVectorNetworks';

const snapMock = vi.fn();
const persistMock = vi.fn();

vi.mock('../snapVectorNetworkJunctions', () => ({ snapVectorNetworkJunctions: (...args: unknown[]): unknown => snapMock(...args) }));
vi.mock('../../vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings', () => ({
  persistVectorNetworkCrossings: (...args: unknown[]): unknown => persistMock(...args),
}));

describe('combineVectorNetworks', () => {
  it('should merge the operand networks, snap their junctions and persist their crossings', () => {
    // mock
    const operands = [
      { segments: { s1: 'segment-1' }, vertices: { v1: 'vertex-1' } },
      { segments: { s2: 'segment-2' }, vertices: { v2: 'vertex-2' } },
    ] as unknown as TVectorNode[];
    snapMock.mockReturnValue({ segments: 'snapped-segments', vertices: 'snapped-vertices' });
    persistMock.mockReturnValue('combined');

    // before
    const result = combineVectorNetworks(operands);

    // result
    expect(snapMock).toHaveBeenCalledWith({ s1: 'segment-1', s2: 'segment-2' }, { v1: 'vertex-1', v2: 'vertex-2' });
    expect(persistMock).toHaveBeenCalledWith('snapped-segments', 'snapped-vertices');
    expect(result).toBe('combined');
  });
});
