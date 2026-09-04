// types
import { LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrapCounterHugSize } from '../getAutoLayoutWrapCounterHugSize';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

describe('getAutoLayoutWrapCounterHugSize', () => {
  it('should sum each line’s thickness plus the counter gap between lines, for a horizontal frame', () => {
    const lines = [[{ height: 20, id: 'a', width: 30 }], [{ height: 30, id: 'b', width: 30 }]];

    expect(getAutoLayoutWrapCounterHugSize(LayoutMode.horizontal, 5, NO_PADDING, lines)).toBe(55);
  });

  it('should measure line thickness by width, not height, for a vertical frame', () => {
    const lines = [[{ height: 30, id: 'a', width: 20 }], [{ height: 30, id: 'b', width: 40 }]];

    expect(getAutoLayoutWrapCounterHugSize(LayoutMode.vertical, 5, NO_PADDING, lines)).toBe(65);
  });

  it('should add padding on the counter axis', () => {
    const lines = [[{ height: 20, id: 'a', width: 30 }]];

    expect(
      getAutoLayoutWrapCounterHugSize(
        LayoutMode.horizontal,
        0,
        { paddingBottom: 4, paddingLeft: 0, paddingRight: 0, paddingTop: 6 },
        lines,
      ),
    ).toBe(30);
  });
});
