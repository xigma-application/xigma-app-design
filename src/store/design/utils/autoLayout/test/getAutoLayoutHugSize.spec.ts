// types
import { LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutHugSize } from '../getAutoLayoutHugSize';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

describe('getAutoLayoutHugSize', () => {
  it('should sum widths plus gaps for the primary axis and take the tallest child for the counter axis, horizontal', () => {
    const size = getAutoLayoutHugSize(LayoutMode.horizontal, 10, NO_PADDING, [
      { height: 20, id: 'a', width: 30 },
      { height: 50, id: 'b', width: 40 },
    ]);

    // 30 + 10 + 40 = 80 wide; tallest child is 50
    expect(size).toEqual({ height: 50, width: 80 });
  });

  it('should sum heights plus gaps for the primary axis and take the widest child for the counter axis, vertical', () => {
    const size = getAutoLayoutHugSize(LayoutMode.vertical, 10, NO_PADDING, [
      { height: 20, id: 'a', width: 30 },
      { height: 50, id: 'b', width: 40 },
    ]);

    // 20 + 10 + 50 = 80 tall; widest child is 40
    expect(size).toEqual({ height: 80, width: 40 });
  });

  it('should add the padding on both sides of each axis', () => {
    const size = getAutoLayoutHugSize(LayoutMode.horizontal, 0, { paddingBottom: 4, paddingLeft: 8, paddingRight: 12, paddingTop: 16 }, [
      { height: 20, id: 'a', width: 30 },
    ]);

    // width: 30 + 8 + 12 = 50; height: 20 + 16 + 4 = 40
    expect(size).toEqual({ height: 40, width: 50 });
  });

  it('should return just the padding for an empty frame', () => {
    const size = getAutoLayoutHugSize(LayoutMode.vertical, 10, { paddingBottom: 2, paddingLeft: 2, paddingRight: 2, paddingTop: 2 }, []);

    expect(size).toEqual({ height: 4, width: 4 });
  });
});
