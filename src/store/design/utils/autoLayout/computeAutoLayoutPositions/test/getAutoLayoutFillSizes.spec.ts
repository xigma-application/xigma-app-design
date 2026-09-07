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
});
