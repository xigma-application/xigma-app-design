// utils
import { getDraggedBlockPreviewMeta } from '../getDraggedBlockPreviewMeta';

const SLOTS = [
  { x: 200, y: 0 },
  { x: 300, y: 0 },
];

describe('getDraggedBlockPreviewMeta', () => {
  it('keys the member slots by node id and names the grabbed member', () => {
    // action
    const meta = getDraggedBlockPreviewMeta(['b', 'c'], 'b', SLOTS);

    // result
    expect(meta).toEqual({
      draggedGrabbedId: 'b',
      draggedMemberSlots: { b: { x: 200, y: 0 }, c: { x: 300, y: 0 } },
    });
  });

  it('names the second member when it is the one grabbed', () => {
    // action
    const meta = getDraggedBlockPreviewMeta(['b', 'c'], 'c', SLOTS);

    // result
    expect(meta.draggedGrabbedId).toBe('c');
  });

  it('falls back to the first member when the grabbed id is null or not in the block', () => {
    // action
    expect(getDraggedBlockPreviewMeta(['b', 'c'], null, SLOTS).draggedGrabbedId).toBe('b');
    expect(getDraggedBlockPreviewMeta(['b', 'c'], 'zzz', SLOTS).draggedGrabbedId).toBe('b');
  });
});
