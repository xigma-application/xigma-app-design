// types
import { LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrapPrimaryHugSize } from '../getAutoLayoutWrapPrimaryHugSize';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

describe('getAutoLayoutWrapPrimaryHugSize', () => {
  it('should hug to the widest line’s content length, horizontal', () => {
    const lines = [
      [
        { height: 10, id: 'a', width: 30 },
        { height: 10, id: 'b', width: 20 },
      ],
      [{ height: 10, id: 'c', width: 50 }],
    ];

    // line 1: 30 + 10 gap + 20 = 60, line 2: 50 — the widest line wins
    expect(getAutoLayoutWrapPrimaryHugSize(LayoutMode.horizontal, 10, NO_PADDING, lines)).toBe(60);
  });

  it('should add primary-axis padding on top of the widest line, horizontal', () => {
    const lines = [[{ height: 10, id: 'a', width: 60 }]];
    const padding = { paddingBottom: 0, paddingLeft: 15, paddingRight: 15, paddingTop: 0 };

    expect(getAutoLayoutWrapPrimaryHugSize(LayoutMode.horizontal, 10, padding, lines)).toBe(90);
  });

  it('should use the tallest line’s content length and vertical padding, vertical', () => {
    const lines = [[{ height: 40, id: 'a', width: 10 }]];
    const padding = { paddingBottom: 5, paddingLeft: 0, paddingRight: 0, paddingTop: 5 };

    expect(getAutoLayoutWrapPrimaryHugSize(LayoutMode.vertical, 10, padding, lines)).toBe(50);
  });

  it('should return just the padding when there are no lines', () => {
    const padding = { paddingBottom: 0, paddingLeft: 5, paddingRight: 5, paddingTop: 0 };

    expect(getAutoLayoutWrapPrimaryHugSize(LayoutMode.horizontal, 10, padding, [])).toBe(10);
  });
});
