// types
import { LayoutVersion, SizingMode, StrokeAlign } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

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

  describe('per-child stroke inset', () => {
    const fillChild = (id: string, overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
      height: 20,
      id,
      width: 0,
      widthSizingMode: SizingMode.fill,
      ...overrides,
    });

    it('should equalise content area, not total width, for fill children with an inside stroke under the updated version', () => {
      const sizes = getAutoLayoutFillSizes(true, 0, 100, 40, [
        fillChild('a', { strokeAlign: StrokeAlign.inside, strokeWidth: 10 }),
        fillChild('b'),
      ]);

      // leftover 100 - 10 inset = 90 content, split 45/45; a carries its 10px stroke on top
      expect(sizes).toEqual([
        { ...fillChild('a', { strokeAlign: StrokeAlign.inside, strokeWidth: 10 }), width: 55 },
        { ...fillChild('b'), width: 45 },
      ]);
    });

    it('should split total width evenly, ignoring the child stroke, under the legacy version', () => {
      const sizes = getAutoLayoutFillSizes(
        true,
        0,
        100,
        40,
        [fillChild('a', { strokeAlign: StrokeAlign.inside, strokeWidth: 10 }), fillChild('b')],
        LayoutVersion.legacy,
      );

      expect(sizes).toEqual([
        { ...fillChild('a', { strokeAlign: StrokeAlign.inside, strokeWidth: 10 }), width: 50 },
        { ...fillChild('b'), width: 50 },
      ]);
    });

    it('should ignore a centred child stroke under the updated version, since only inside strokes affect layout', () => {
      const sizes = getAutoLayoutFillSizes(true, 0, 100, 40, [
        fillChild('a', { strokeAlign: StrokeAlign.center, strokeWidth: 10 }),
        fillChild('b'),
      ]);

      expect(sizes).toEqual([
        { ...fillChild('a', { strokeAlign: StrokeAlign.center, strokeWidth: 10 }), width: 50 },
        { ...fillChild('b'), width: 50 },
      ]);
    });

    it('should apply a fill child minWidth against its content area, then add the stroke back, under the updated version', () => {
      const sizes = getAutoLayoutFillSizes(true, 0, 100, 40, [
        fillChild('a', { minWidth: 60, strokeAlign: StrokeAlign.inside, strokeWidth: 10 }),
        fillChild('b'),
      ]);

      // content min 60 - 10 = 50 beats the 45 equal share; a content 50 -> width 60, b takes 90 - 50 = 40
      expect(sizes).toEqual([
        { ...fillChild('a', { minWidth: 60, strokeAlign: StrokeAlign.inside, strokeWidth: 10 }), width: 60 },
        { ...fillChild('b'), width: 40 },
      ]);
    });
  });
});
