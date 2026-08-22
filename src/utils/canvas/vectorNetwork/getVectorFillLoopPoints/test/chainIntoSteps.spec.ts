// utils
import { chainIntoSteps } from '../chainIntoSteps';

describe('chainIntoSteps', () => {
  it('should chain multiple chainables into one closed loop of steps', () => {
    // mock — a->b->c->a
    const chainables = [
      { endId: 'b', id: 's1', startId: 'a' },
      { endId: 'c', id: 's2', startId: 'b' },
      { endId: 'a', id: 's3', startId: 'c' },
    ];

    // before
    const steps = chainIntoSteps(chainables);

    // result
    expect(steps).toEqual([
      { fromId: 'a', segmentId: 's1', toId: 'b' },
      { fromId: 'b', segmentId: 's2', toId: 'c' },
      { fromId: 'c', segmentId: 's3', toId: 'a' },
    ]);
  });

  it('should accept a single self-closing chainable (its own startId equals its own endId)', () => {
    // mock
    const chainables = [{ endId: 'a', id: 's1', startId: 'a' }];

    // before
    const steps = chainIntoSteps(chainables);

    // result
    expect(steps).toEqual([{ fromId: 'a', segmentId: 's1', toId: 'a' }]);
  });

  it('should return null for a single chainable that doesn’t close back on itself', () => {
    // mock
    const chainables = [{ endId: 'b', id: 's1', startId: 'a' }];

    // before / result
    expect(chainIntoSteps(chainables)).toBeNull();
  });

  it('should return null when the chainables don’t all connect (a disconnected member breaks the walk)', () => {
    // mock — s2 shares no vertex with s1
    const chainables = [
      { endId: 'b', id: 's1', startId: 'a' },
      { endId: 'y', id: 's2', startId: 'x' },
    ];

    // before / result
    expect(chainIntoSteps(chainables)).toBeNull();
  });

  it('should return null when the chain connects but ends open instead of closing back to the start', () => {
    // mock — a->b->c, never returns to "a"
    const chainables = [
      { endId: 'b', id: 's1', startId: 'a' },
      { endId: 'c', id: 's2', startId: 'b' },
    ];

    // before / result
    expect(chainIntoSteps(chainables)).toBeNull();
  });
});
