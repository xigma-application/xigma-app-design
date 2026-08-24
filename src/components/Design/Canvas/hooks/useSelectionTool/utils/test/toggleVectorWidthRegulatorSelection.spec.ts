// utils
import { toggleVectorWidthRegulatorSelection } from '../toggleVectorWidthRegulatorSelection';

describe('toggleVectorWidthRegulatorSelection', () => {
  it('should add the regulator as a "point" entry when it is not yet selected', () => {
    // before
    const result = toggleVectorWidthRegulatorSelection([{ nodeId: 'n1', pointId: 'p1', side: 'point' }], 'n1', 'p2');

    // result
    expect(result).toEqual([
      { nodeId: 'n1', pointId: 'p1', side: 'point' },
      { nodeId: 'n1', pointId: 'p2', side: 'point' },
    ]);
  });

  it('should remove every entry for the regulator, including any selected diamond sides, when it is already selected', () => {
    // before — p1 was the primary of a prior drag, so it also carries left/right entries
    const result = toggleVectorWidthRegulatorSelection(
      [
        { nodeId: 'n1', pointId: 'p1', side: 'left' },
        { nodeId: 'n1', pointId: 'p1', side: 'right' },
        { nodeId: 'n1', pointId: 'p1', side: 'point' },
        { nodeId: 'n1', pointId: 'p2', side: 'point' },
      ],
      'n1',
      'p1',
    );

    // result
    expect(result).toEqual([{ nodeId: 'n1', pointId: 'p2', side: 'point' }]);
  });

  it('should not confuse regulators with the same pointId on different nodes', () => {
    // before
    const result = toggleVectorWidthRegulatorSelection([{ nodeId: 'n1', pointId: 'p1', side: 'point' }], 'n2', 'p1');

    // result
    expect(result).toEqual([
      { nodeId: 'n1', pointId: 'p1', side: 'point' },
      { nodeId: 'n2', pointId: 'p1', side: 'point' },
    ]);
  });
});
