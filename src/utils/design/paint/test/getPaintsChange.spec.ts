// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getPaintsChange } from '../getPaintsChange';

const paint: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };

describe('getPaintsChange', () => {
  it('should key the change by fills', () => {
    expect(getPaintsChange('fills', [paint])).toEqual({ fills: [paint] });
  });

  it('should key the change by strokes', () => {
    expect(getPaintsChange('strokes', [paint])).toEqual({ strokes: [paint] });
  });
});
