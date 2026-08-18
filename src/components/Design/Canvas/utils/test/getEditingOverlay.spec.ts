// utils
import { getEditingOverlay } from '../getEditingOverlay';

describe('getEditingOverlay', () => {
  it('should return the contenteditable overlay element when one is mounted', () => {
    // mock
    const overlay = document.createElement('div');

    overlay.setAttribute('contenteditable', 'true');
    document.body.appendChild(overlay);

    // before
    const result = getEditingOverlay();

    // result
    expect(result).toBe(overlay);

    // after
    overlay.remove();
  });

  it('should return null when no contenteditable overlay is mounted', () => {
    // before
    const result = getEditingOverlay();

    // result
    expect(result).toBeNull();
  });
});
