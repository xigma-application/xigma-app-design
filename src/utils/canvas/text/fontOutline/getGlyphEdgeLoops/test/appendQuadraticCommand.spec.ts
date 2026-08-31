// utils
import { appendQuadraticCommand } from '../appendQuadraticCommand';

// types
import { TWalkState } from '../types';

const STATE: TWalkState = { current: { x: 0, y: 0 }, edges: [], loops: [], subpathStart: { x: 0, y: 0 } };

describe('appendQuadraticCommand', () => {
  it('should append a cubic edge whose tangents come from the quadratic control point', () => {
    // action
    const next = appendQuadraticCommand(STATE, { type: 'Q', x: 12, x1: 6, y: 0, y1: 9 });

    // result
    expect(next.current).toEqual({ x: 12, y: 0 });
    expect(next.edges).toEqual([
      { end: { x: 12, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: { x: -4, y: 6 }, tangentStart: { x: 4, y: 6 } },
    ]);
  });
});
