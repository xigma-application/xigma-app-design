// utils
import { getDraggedBlockPreviewMeta } from '../getDraggedBlockPreviewMeta';

const SLOTS = [
  { x: 200, y: 0 },
  { x: 300, y: 0 },
];
const CLAMP_BOX = { height: 400, width: 600, x: 0, y: 0 };
const CLAMP_CENTER = { x: 300, y: 200 };

describe('getDraggedBlockPreviewMeta', () => {
  it('keys the member slots by node id, names the grabbed member, and carries the clamp box/pivot + contiguous flag', () => {
    // action
    const meta = getDraggedBlockPreviewMeta(['b', 'c'], 'b', SLOTS, CLAMP_BOX, CLAMP_CENTER, 0, false);

    // result
    expect(meta).toEqual({
      draggedClampBox: CLAMP_BOX,
      draggedClampCenter: CLAMP_CENTER,
      draggedClampRotation: 0,
      draggedContiguous: false,
      draggedGrabbedId: 'b',
      draggedMemberSlots: { b: { x: 200, y: 0 }, c: { x: 300, y: 0 } },
    });
  });

  it('names the second member when it is the one grabbed', () => {
    // action
    const meta = getDraggedBlockPreviewMeta(['b', 'c'], 'c', SLOTS, CLAMP_BOX, CLAMP_CENTER, 0, false);

    // result
    expect(meta.draggedGrabbedId).toBe('c');
  });

  it('marks the block contiguous when told to', () => {
    // action
    const meta = getDraggedBlockPreviewMeta(['b', 'c'], 'c', SLOTS, CLAMP_BOX, CLAMP_CENTER, 0, true);

    // result
    expect(meta.draggedContiguous).toBe(true);
  });

  it('carries the frame’s own rotation for the clamp to un-rotate against', () => {
    // action
    const meta = getDraggedBlockPreviewMeta(['b', 'c'], 'b', SLOTS, CLAMP_BOX, CLAMP_CENTER, 90, false);

    // result
    expect(meta.draggedClampRotation).toBe(90);
  });

  it('falls back to the first member when the grabbed id is null or not in the block', () => {
    // action
    expect(getDraggedBlockPreviewMeta(['b', 'c'], null, SLOTS, CLAMP_BOX, CLAMP_CENTER, 0, false).draggedGrabbedId).toBe('b');
    expect(getDraggedBlockPreviewMeta(['b', 'c'], 'zzz', SLOTS, CLAMP_BOX, CLAMP_CENTER, 0, false).draggedGrabbedId).toBe('b');
  });
});
