// utils
import { appendCubicCommand } from '../appendCubicCommand';

// types
import { TWalkState } from '../types';

const STATE: TWalkState = { current: { x: 0, y: 0 }, edges: [], loops: [], subpathStart: { x: 0, y: 0 } };

describe('appendCubicCommand', () => {
  it('should append the cubic edge with each tangent expressed relative to its own endpoint', () => {
    // action
    const next = appendCubicCommand(STATE, { type: 'C', x: 10, x1: 2, x2: 8, y: 0, y1: 6, y2: 6 });

    // result
    expect(next.current).toEqual({ x: 10, y: 0 });
    expect(next.edges).toEqual([
      { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: { x: -2, y: 6 }, tangentStart: { x: 2, y: 6 } },
    ]);
  });
});
