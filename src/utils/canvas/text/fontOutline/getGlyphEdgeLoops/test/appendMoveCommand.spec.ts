// utils
import { appendMoveCommand } from '../appendMoveCommand';

// types
import { TWalkState } from '../types';

const EMPTY_STATE: TWalkState = { current: { x: 0, y: 0 }, edges: [], loops: [], subpathStart: { x: 0, y: 0 } };
const STRAIGHT_EDGE = { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null };

describe('appendMoveCommand', () => {
  it('should move the pen and subpath start to the command point', () => {
    // action
    const next = appendMoveCommand(EMPTY_STATE, { type: 'M', x: 4, y: 7 });

    // result
    expect(next.current).toEqual({ x: 4, y: 7 });
    expect(next.subpathStart).toEqual({ x: 4, y: 7 });
    expect(next.edges).toEqual([]);
  });

  it('should flush the edges gathered so far into a finished loop', () => {
    // mock
    const state: TWalkState = { ...EMPTY_STATE, edges: [STRAIGHT_EDGE] };

    // action
    const next = appendMoveCommand(state, { type: 'M', x: 4, y: 7 });

    // result
    expect(next.loops).toEqual([[STRAIGHT_EDGE]]);
    expect(next.edges).toEqual([]);
  });

  it('should not flush anything when no edge has been drawn yet', () => {
    // action
    const next = appendMoveCommand(EMPTY_STATE, { type: 'M', x: 4, y: 7 });

    // result
    expect(next.loops).toEqual([]);
  });
});
