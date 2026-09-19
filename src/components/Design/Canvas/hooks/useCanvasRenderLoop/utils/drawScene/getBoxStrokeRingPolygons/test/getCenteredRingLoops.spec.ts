// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getCenteredRingLoops } from '../getCenteredRingLoops';
import { rect } from './nodeFixture';

describe('getCenteredRingLoops', () => {
  it('should return the outer and inner loops centred on the edge whatever the node alignment', () => {
    // action
    const [outer, inner] = getCenteredRingLoops(rect({ strokeAlign: StrokeAlign.inside }));

    // result
    expect(Math.min(...outer.map((point) => point.x))).toBeCloseTo(8);
    expect(Math.min(...inner.map((point) => point.x))).toBeCloseTo(12);
  });
});
