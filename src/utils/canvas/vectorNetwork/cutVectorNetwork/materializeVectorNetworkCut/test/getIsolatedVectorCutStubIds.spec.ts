// utils
import { getIsolatedVectorCutStubIds } from '../getIsolatedVectorCutStubIds';

describe('getIsolatedVectorCutStubIds', () => {
  it('should collect the before/after stub ids of a crossing whose sides never touch a chord', () => {
    // mock — a single crossing, no chord attached to either of its two sides
    const sides = [{ afterId: 'after1', beforeId: 'before1', point: { x: 0, y: 0 }, sideAId: 'a1', sideBId: 'b1' }];

    // before
    const isolated = getIsolatedVectorCutStubIds(sides, new Set());

    // result
    expect(isolated).toEqual(new Set(['before1', 'after1']));
  });

  it('should exclude a crossing’s stubs when either of its two sides is used by a chord', () => {
    // mock — two crossings; a chord connects crossing 1's sideA to crossing 2's sideA
    const sides = [
      { afterId: 'after1', beforeId: 'before1', point: { x: 0, y: 0 }, sideAId: 'a1', sideBId: 'b1' },
      { afterId: 'after2', beforeId: 'before2', point: { x: 10, y: 10 }, sideAId: 'a2', sideBId: 'b2' },
    ];
    const chordedVertexIds = new Set(['a1', 'a2']);

    // before
    const isolated = getIsolatedVectorCutStubIds(sides, chordedVertexIds);

    // result — neither crossing is isolated: each has at least one chorded side
    expect(isolated).toEqual(new Set());
  });

  it('should treat each crossing independently — an isolated one and a chorded one in the same result', () => {
    // mock — crossing 1 has a chord on sideB; crossing 2 has no chord attached anywhere
    const sides = [
      { afterId: 'after1', beforeId: 'before1', point: { x: 0, y: 0 }, sideAId: 'a1', sideBId: 'b1' },
      { afterId: 'after2', beforeId: 'before2', point: { x: 10, y: 10 }, sideAId: 'a2', sideBId: 'b2' },
    ];
    const chordedVertexIds = new Set(['b1']);

    // before
    const isolated = getIsolatedVectorCutStubIds(sides, chordedVertexIds);

    // result — only crossing 2's stubs are isolated
    expect(isolated).toEqual(new Set(['before2', 'after2']));
  });
});
