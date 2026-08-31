// utils
import { appendCloseCommand } from '../appendCloseCommand';

// types
import { TWalkState } from '../types';

describe('appendCloseCommand', () => {
  it('should append a straight edge back to the subpath start and move the pen there', () => {
    // mock
    const state: TWalkState = { current: { x: 10, y: 5 }, edges: [], loops: [], subpathStart: { x: 0, y: 0 } };

    // action
    const next = appendCloseCommand(state);

    // result
    expect(next.current).toEqual({ x: 0, y: 0 });
    expect(next.edges).toEqual([{ end: { x: 0, y: 0 }, start: { x: 10, y: 5 }, tangentEnd: null, tangentStart: null }]);
  });

  it('should return the state untouched when the pen is already back at the subpath start', () => {
    // mock
    const state: TWalkState = { current: { x: 0, y: 0 }, edges: [], loops: [], subpathStart: { x: 0, y: 0 } };

    // action
    const next = appendCloseCommand(state);

    // result
    expect(next).toBe(state);
  });
});
