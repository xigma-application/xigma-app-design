// others
import { CARET_BLINK_INTERVAL_MS } from 'constant/canvas';

// utils
import { isCaretBlinkedOn } from '../isCaretBlinkedOn';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isCaretBlinkedOn', () => {
  it('should be on right when the selection last changed', () => {
    // mock
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    // result
    expect(isCaretBlinkedOn(1000)).toBe(true);
  });

  it('should stay on for a full interval after the selection last changed', () => {
    // mock
    vi.spyOn(Date, 'now').mockReturnValue(1000 + CARET_BLINK_INTERVAL_MS - 1);

    // result
    expect(isCaretBlinkedOn(1000)).toBe(true);
  });

  it('should turn off for the second interval', () => {
    // mock
    vi.spyOn(Date, 'now').mockReturnValue(1000 + CARET_BLINK_INTERVAL_MS);

    // result
    expect(isCaretBlinkedOn(1000)).toBe(false);
  });

  it('should turn back on for the third interval', () => {
    // mock
    vi.spyOn(Date, 'now').mockReturnValue(1000 + CARET_BLINK_INTERVAL_MS * 2);

    // result
    expect(isCaretBlinkedOn(1000)).toBe(true);
  });
});
