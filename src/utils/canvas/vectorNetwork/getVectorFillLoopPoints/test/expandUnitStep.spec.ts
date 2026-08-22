// utils
import { expandUnitStep } from '../expandUnitStep';

const piece1 = { endId: 'x', id: 's1#0', startId: 'a', tangentEnd: null, tangentStart: null };
const piece2 = { endId: 'b', id: 's1#1', startId: 'x', tangentEnd: null, tangentStart: null };
const unit = { endId: 'b', id: 's1[v:a|v:b]', pieces: [piece1, piece2], startId: 'a' };
const unitsById = new Map([[unit.id, unit]]);

describe('expandUnitStep', () => {
  it('should expand a unit walked forward (entered at its own start) into its pieces in their own stored order', () => {
    // before
    const steps = expandUnitStep({ fromId: 'a', segmentId: unit.id, toId: 'b' }, unitsById);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 's1#0', toId: 'x' },
      { fromId: 'x', segmentId: 's1#1', toId: 'b' },
    ]);
  });

  it('should expand a unit walked backward (entered at its own end) into its pieces reversed, each piece also flipped', () => {
    // before
    const steps = expandUnitStep({ fromId: 'b', segmentId: unit.id, toId: 'a' }, unitsById);

    // result
    expect(steps).toEqual([
      { fromId: 'b', segmentId: 's1#1', toId: 'x' },
      { fromId: 'x', segmentId: 's1#0', toId: 'a' },
    ]);
  });
});
