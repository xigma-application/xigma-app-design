// utils
import { walkNextStep } from '../walkNextStep';

describe('walkNextStep', () => {
  it('should walk to a chainable found via its startId matching the current vertex', () => {
    // mock
    const chainables = [{ endId: 'c', id: 's2', startId: 'b' }];

    // before
    const steps = walkNextStep(chainables, new Set(['s2']), 'b', []);

    // result
    expect(steps).toEqual([{ fromId: 'b', segmentId: 's2', toId: 'c' }]);
  });

  it('should walk to a chainable found via its endId matching the current vertex (declared in the opposite direction)', () => {
    // mock — s2 is declared c->b, so reaching it from "b" only matches via its endId, not startId
    const chainables = [{ endId: 'b', id: 's2', startId: 'c' }];

    // before
    const steps = walkNextStep(chainables, new Set(['s2']), 'b', []);

    // result
    expect(steps).toEqual([{ fromId: 'b', segmentId: 's2', toId: 'c' }]);
  });

  it('should recurse until every remaining chainable has been consumed', () => {
    // mock — a->b->c, walking from b with s2 and s3 both remaining
    const chainables = [
      { endId: 'b', id: 's1', startId: 'a' },
      { endId: 'c', id: 's2', startId: 'b' },
      { endId: 'a', id: 's3', startId: 'c' },
    ];

    // before
    const steps = walkNextStep(chainables, new Set(['s2', 's3']), 'b', [{ fromId: 'a', segmentId: 's1', toId: 'b' }]);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 's1', toId: 'b' },
      { fromId: 'b', segmentId: 's2', toId: 'c' },
      { fromId: 'c', segmentId: 's3', toId: 'a' },
    ]);
  });

  it('should return null when no remaining chainable touches the current vertex (a dead end)', () => {
    // mock — the only remaining chainable doesn't connect to "b" at all
    const chainables = [{ endId: 'y', id: 's2', startId: 'x' }];

    // before / result
    expect(walkNextStep(chainables, new Set(['s2']), 'b', [])).toBeNull();
  });
});
