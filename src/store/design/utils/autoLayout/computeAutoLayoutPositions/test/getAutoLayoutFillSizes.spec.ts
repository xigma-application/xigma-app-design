// types
import { SizingMode } from 'types/design/enums';

// utils
import { getAutoLayoutFillSizes } from '../getAutoLayoutFillSizes';

describe('getAutoLayoutFillSizes', () => {
  it('should leave fixed sizes unchanged, horizontal', () => {
    const sizes = getAutoLayoutFillSizes(true, 10, 100, 40, [{ height: 20, id: 'a', width: 30 }]);

    expect(sizes).toEqual([{ height: 20, id: 'a', width: 30 }]);
  });

  it('should stretch a fill-sized child on the primary axis to consume the remaining space, horizontal', () => {
    const sizes = getAutoLayoutFillSizes(true, 10, 100, 40, [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 0, widthSizingMode: SizingMode.fill },
    ]);

    // 100 - 10 gap - 30 fixed = 60 left for the single fill child
    expect(sizes).toEqual([
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 60, widthSizingMode: SizingMode.fill },
    ]);
  });

  it('should stretch a fill-sized child on the counter axis to the available counter size, horizontal', () => {
    const sizes = getAutoLayoutFillSizes(true, 10, 100, 40, [{ height: 0, heightSizingMode: SizingMode.fill, id: 'a', width: 30 }]);

    expect(sizes).toEqual([{ height: 40, heightSizingMode: SizingMode.fill, id: 'a', width: 30 }]);
  });

  it('should swap primary/counter axes and leave fixed sizes unchanged, vertical', () => {
    const sizes = getAutoLayoutFillSizes(false, 10, 100, 40, [{ height: 20, id: 'a', width: 30 }]);

    expect(sizes).toEqual([{ height: 20, id: 'a', width: 30 }]);
  });

  it('should return an empty array, without gaps, when there are no children', () => {
    const sizes = getAutoLayoutFillSizes(true, 10, 100, 40, []);

    expect(sizes).toEqual([]);
  });

  it('should cap a fill child on the primary axis at its own maxWidth and redistribute the surplus to its sibling', () => {
    const sizes = getAutoLayoutFillSizes(true, 0, 100, 40, [
      { height: 20, id: 'a', maxWidth: 20, width: 0, widthSizingMode: SizingMode.fill },
      { height: 20, id: 'b', width: 0, widthSizingMode: SizingMode.fill },
    ]);

    // a is capped to 20; the 80 leftover it doesn't take all flows to b instead of splitting 50/50
    expect(sizes).toEqual([
      { height: 20, id: 'a', maxWidth: 20, width: 20, widthSizingMode: SizingMode.fill },
      { height: 20, id: 'b', width: 80, widthSizingMode: SizingMode.fill },
    ]);
  });

  it('should honor a fill child’s minWidth on the primary axis even when it exceeds its equal share', () => {
    const sizes = getAutoLayoutFillSizes(true, 0, 20, 40, [
      { height: 20, id: 'a', minWidth: 15, width: 0, widthSizingMode: SizingMode.fill },
      { height: 20, id: 'b', width: 0, widthSizingMode: SizingMode.fill },
    ]);

    // leftover is only 20; a's 15px min leaves just 5 for b, instead of the 10/10 even split
    expect(sizes).toEqual([
      { height: 20, id: 'a', minWidth: 15, width: 15, widthSizingMode: SizingMode.fill },
      { height: 20, id: 'b', width: 5, widthSizingMode: SizingMode.fill },
    ]);
  });

  it('should clamp a fill child on the counter axis to its own maxHeight, independent of siblings', () => {
    const sizes = getAutoLayoutFillSizes(true, 0, 100, 40, [
      { height: 0, heightSizingMode: SizingMode.fill, id: 'a', maxHeight: 25, width: 30 },
    ]);

    expect(sizes).toEqual([{ height: 25, heightSizingMode: SizingMode.fill, id: 'a', maxHeight: 25, width: 30 }]);
  });

  it('should cap a fill child on the primary axis at its own maxHeight, vertical', () => {
    const sizes = getAutoLayoutFillSizes(false, 0, 100, 40, [
      { height: 0, heightSizingMode: SizingMode.fill, id: 'a', maxHeight: 20, width: 20 },
    ]);

    expect(sizes).toEqual([{ height: 20, heightSizingMode: SizingMode.fill, id: 'a', maxHeight: 20, width: 20 }]);
  });

  it('should clamp a fill child on the counter axis up to its own minHeight, independent of siblings', () => {
    const sizes = getAutoLayoutFillSizes(true, 0, 100, 10, [
      { height: 0, heightSizingMode: SizingMode.fill, id: 'a', minHeight: 50, width: 30 },
    ]);

    expect(sizes).toEqual([{ height: 50, heightSizingMode: SizingMode.fill, id: 'a', minHeight: 50, width: 30 }]);
  });
});
