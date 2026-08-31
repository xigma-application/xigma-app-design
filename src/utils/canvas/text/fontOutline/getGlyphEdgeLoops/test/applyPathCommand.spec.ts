import { PathCommand } from 'opentype.js';

// utils
import { applyPathCommand } from '../applyPathCommand';

// types
import { TWalkState } from '../types';

const STATE: TWalkState = { current: { x: 1, y: 1 }, edges: [], loops: [], subpathStart: { x: 1, y: 1 } };

describe('applyPathCommand', () => {
  it('should route an "M" command to a fresh subpath', () => {
    // action
    const next = applyPathCommand(
      { ...STATE, edges: [{ end: STATE.current, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null }] },
      { type: 'M', x: 5, y: 5 },
    );

    // result
    expect(next.subpathStart).toEqual({ x: 5, y: 5 });
    expect(next.loops).toHaveLength(1);
  });

  it('should route an "L" command to a straight edge', () => {
    // action
    const next = applyPathCommand(STATE, { type: 'L', x: 5, y: 5 });

    // result
    expect(next.edges).toEqual([{ end: { x: 5, y: 5 }, start: { x: 1, y: 1 }, tangentEnd: null, tangentStart: null }]);
  });

  it('should route a "Q" command to a cubic edge with derived tangents', () => {
    // action
    const next = applyPathCommand(STATE, { type: 'Q', x: 7, x1: 4, y: 1, y1: 4 });

    // result
    expect(next.edges[0].tangentStart).toEqual({ x: 2, y: 2 });
  });

  it('should route a "C" command to a cubic edge carried through as-is', () => {
    // action
    const next = applyPathCommand(STATE, { type: 'C', x: 7, x1: 3, x2: 5, y: 1, y1: 3, y2: 3 });

    // result
    expect(next.edges[0].tangentStart).toEqual({ x: 2, y: 2 });
  });

  it('should route a "Z" command to a closing edge', () => {
    // mock
    const open: TWalkState = { ...STATE, current: { x: 9, y: 9 } };

    // action
    const next = applyPathCommand(open, { type: 'Z' } as PathCommand);

    // result
    expect(next.current).toEqual({ x: 1, y: 1 });
    expect(next.edges).toHaveLength(1);
  });
});
