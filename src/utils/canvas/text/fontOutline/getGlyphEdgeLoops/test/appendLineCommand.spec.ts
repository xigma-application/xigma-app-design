// utils
import { appendLineCommand } from '../appendLineCommand';

// types
import { TWalkState } from '../types';

const STATE: TWalkState = { current: { x: 2, y: 3 }, edges: [], loops: [], subpathStart: { x: 2, y: 3 } };

describe('appendLineCommand', () => {
  it('should append a tangent-free straight edge from the current pen position and advance the pen', () => {
    // action
    const next = appendLineCommand(STATE, { type: 'L', x: 10, y: 20 });

    // result
    expect(next.current).toEqual({ x: 10, y: 20 });
    expect(next.edges).toEqual([{ end: { x: 10, y: 20 }, start: { x: 2, y: 3 }, tangentEnd: null, tangentStart: null }]);
  });

  it('should keep the edges already collected', () => {
    // mock
    const seeded: TWalkState = { ...STATE, edges: [{ end: { x: 2, y: 3 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null }] };

    // action
    const next = appendLineCommand(seeded, { type: 'L', x: 10, y: 20 });

    // result
    expect(next.edges).toHaveLength(2);
  });
});
