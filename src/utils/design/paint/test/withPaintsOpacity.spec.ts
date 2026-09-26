// types
import { TPaint } from 'types/design/paint/types';

// utils
import { withPaintsOpacity } from '../withPaintsOpacity';

const paints: TPaint[] = [{ color: '#ff0000', opacity: 80, type: 'solid' }];

describe('withPaintsOpacity', () => {
  it('should keep the same paints at full opacity', () => {
    // result
    expect(withPaintsOpacity(paints, 1)).toBe(paints);
  });

  it('should scale the opacity of every paint', () => {
    // result
    expect(withPaintsOpacity(paints, 0.5)).toEqual([{ color: '#ff0000', opacity: 40, type: 'solid' }]);
  });
});
