// utils
import { toggleVectorHandleSelection } from '../toggleVectorHandleSelection';

describe('toggleVectorHandleSelection', () => {
  it('should add the handle when it is not yet selected', () => {
    // before
    const result = toggleVectorHandleSelection([{ end: 'start', segmentId: 's1' }], { end: 'end', segmentId: 's2' });

    // result
    expect(result).toEqual([
      { end: 'start', segmentId: 's1' },
      { end: 'end', segmentId: 's2' },
    ]);
  });

  it('should remove the handle when it is already selected', () => {
    // before
    const result = toggleVectorHandleSelection(
      [
        { end: 'start', segmentId: 's1' },
        { end: 'end', segmentId: 's2' },
      ],
      { end: 'start', segmentId: 's1' },
    );

    // result
    expect(result).toEqual([{ end: 'end', segmentId: 's2' }]);
  });

  it('should not confuse two handles on the same segment with different ends', () => {
    // before
    const result = toggleVectorHandleSelection([{ end: 'start', segmentId: 's1' }], { end: 'end', segmentId: 's1' });

    // result
    expect(result).toEqual([
      { end: 'start', segmentId: 's1' },
      { end: 'end', segmentId: 's1' },
    ]);
  });
});
