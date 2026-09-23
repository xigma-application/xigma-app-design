// utils
import { getFlowReorderCandidate } from '../getFlowReorderCandidate';
import { TFlowAxisMove } from '../getFlowAxisMove';

const primaryForward: TFlowAxisMove = { direction: 1, kind: 'primary' };
const primaryBackward: TFlowAxisMove = { direction: -1, kind: 'primary' };
const crossForward: TFlowAxisMove = { direction: 1, kind: 'cross' };
const crossBackward: TFlowAxisMove = { direction: -1, kind: 'cross' };

describe('getFlowReorderCandidate', () => {
  it('should swap forward with the next flow-order neighbor when moving primary-forward mid-line', () => {
    const lineGroups = [['a', 'b', 'c']];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['a'], primaryForward)).toEqual({ anchorId: 'b', position: 'after' });
  });

  it('should swap backward with the previous flow-order neighbor when moving primary-backward mid-line', () => {
    const lineGroups = [['a', 'b', 'c']];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['b'], primaryBackward)).toEqual({ anchorId: 'a', position: 'before' });
  });

  it('should block a primary-forward move at the end of the line', () => {
    const lineGroups = [['a', 'b', 'c']];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['c'], primaryForward)).toBeNull();
  });

  it('should block a primary-backward move at the start of the line', () => {
    const lineGroups = [['a', 'b', 'c']];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['a'], primaryBackward)).toBeNull();
  });

  it('should land after the sibling-recomputed target line’s last item on a cross-forward move', () => {
    const lineGroups = [
      ['a', 'b'],
      ['c', 'd'],
    ];
    // 'b' stays alone once 'a' is excluded — no reabsorption in this fixture
    const siblingLineGroups = [['b'], ['c', 'd']];

    expect(getFlowReorderCandidate(lineGroups, siblingLineGroups, ['a'], crossForward)).toEqual({ anchorId: 'b', position: 'after' });
  });

  it('should follow the sibling recompute, not the original next line, when the vacated line reabsorbs a trailing item (the regression this fixes)', () => {
    const lineGroups = [
      ['a', 'b'],
      ['c', 'd'],
    ];
    // once 'a' is excluded, 'c' (originally the start of line 1) gets pulled back into line 0
    // alongside 'b' — anchoring against the stale original line 1 (['c', 'd']) would land the
    // selection back in its own old line instead of genuinely crossing forward
    const siblingLineGroups = [['b', 'c'], ['d']];

    expect(getFlowReorderCandidate(lineGroups, siblingLineGroups, ['a'], crossForward)).toEqual({ anchorId: 'c', position: 'after' });
  });

  it('should always return null for a cross-backward move — that direction is handled by the dedicated eviction-aware getFlowBackwardCrossCandidateIds instead', () => {
    const lineGroups = [
      ['a', 'b'],
      ['c', 'd'],
    ];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['c'], crossBackward)).toBeNull();
    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['a'], crossBackward)).toBeNull();
  });

  it('should block a cross-forward move on the last line', () => {
    const lineGroups = [
      ['a', 'b'],
      ['c', 'd'],
    ];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['c'], crossForward)).toBeNull();
  });

  it('should block a cross move entirely when the frame has only one line (no wrap), regardless of the sibling recompute', () => {
    const lineGroups = [['a', 'b', 'c']];
    // even though a sibling line technically still exists at index 0, there was never a second
    // ORIGINAL line to cross into — a non-wrapped frame must stay blocked either direction
    const siblingLineGroups = [['a', 'c']];

    expect(getFlowReorderCandidate(lineGroups, siblingLineGroups, ['b'], crossForward)).toBeNull();
    expect(getFlowReorderCandidate(lineGroups, siblingLineGroups, ['b'], crossBackward)).toBeNull();
  });

  it('should move a contiguous multi-selection as one block, primary-forward', () => {
    const lineGroups = [['a', 'b', 'c', 'd']];

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['a', 'b'], primaryForward)).toEqual({ anchorId: 'c', position: 'after' });
  });

  it('should move a contiguous multi-selection as one block, cross-forward, preserving its own order', () => {
    const lineGroups = [
      ['a', 'b', 'c'],
      ['d', 'e'],
    ];
    const siblingLineGroups = [['c'], ['d', 'e']];

    expect(getFlowReorderCandidate(lineGroups, siblingLineGroups, ['a', 'b'], crossForward)).toEqual({
      anchorId: 'c',
      position: 'after',
    });
  });

  it('should block the whole gesture when the selection is not contiguous in flow order', () => {
    const lineGroups = [['a', 'b', 'c', 'd']];

    // 'b' sits unselected between 'a' and 'c'
    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['a', 'c'], primaryForward)).toBeNull();
  });

  it('should block the whole gesture when a contiguous selection already spans two lines', () => {
    const lineGroups = [
      ['a', 'b'],
      ['c', 'd'],
    ];

    // 'b' (end of line 0) and 'c' (start of line 1) are flow-order-adjacent but not in one line
    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['b', 'c'], primaryForward)).toBeNull();
  });

  it('should return null defensively for an axis move outside the known kind/direction combinations', () => {
    const lineGroups = [['a', 'b', 'c']];
    const bogusAxisMove = { direction: 2, kind: 'diagonal' } as unknown as TFlowAxisMove;

    expect(getFlowReorderCandidate(lineGroups, lineGroups, ['a'], bogusAxisMove)).toBeNull();
  });
});
