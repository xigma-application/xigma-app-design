// utils
import { createCursorOverlay } from '../createCursorOverlay';

describe('createCursorOverlay', () => {
  it('should cover the page with a fixed overlay carrying the given cursor', () => {
    // before
    createCursorOverlay('ew-resize');

    // find
    const overlay = document.body.lastElementChild as HTMLDivElement;

    // result
    expect(overlay.style).toMatchObject({ cursor: 'ew-resize', inset: '0px', position: 'fixed', zIndex: '999999' });
  });

  it('should remove the overlay when the returned cleanup runs', () => {
    // mock
    const childCount = document.body.childElementCount;

    // before
    const remove = createCursorOverlay('ns-resize');

    // action
    remove();

    // result
    expect(document.body.childElementCount).toBe(childCount);
  });
});
