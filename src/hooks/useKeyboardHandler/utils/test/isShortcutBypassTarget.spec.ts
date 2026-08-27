// utils
import { isShortcutBypassTarget } from '../isShortcutBypassTarget';

describe('isShortcutBypassTarget', () => {
  it('should return true for an element carrying the bypass data-test attribute', () => {
    // mock
    const input = document.createElement('input');

    input.setAttribute('data-test-bypass-global-shortcuts', 'true');

    expect(isShortcutBypassTarget(input)).toBe(true);
  });

  it('should return true for an element nested inside a bypass-marked ancestor', () => {
    // mock
    const wrapper = document.createElement('div');
    const input = document.createElement('input');

    wrapper.setAttribute('data-test-bypass-global-shortcuts', 'true');
    wrapper.appendChild(input);

    expect(isShortcutBypassTarget(input)).toBe(true);
  });

  it('should return false for a plain input without the bypass attribute', () => {
    expect(isShortcutBypassTarget(document.createElement('input'))).toBe(false);
  });

  it('should return false for null', () => {
    expect(isShortcutBypassTarget(null)).toBe(false);
  });
});
