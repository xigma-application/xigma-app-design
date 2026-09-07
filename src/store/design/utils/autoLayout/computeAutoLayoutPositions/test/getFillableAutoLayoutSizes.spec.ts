// types
import { SizingMode } from 'types/design/enums';

// utils
import { getFillableAutoLayoutSizes } from '../getFillableAutoLayoutSizes';

describe('getFillableAutoLayoutSizes', () => {
  it('should strip the width sizing mode when the width axis hugs', () => {
    const sizes = getFillableAutoLayoutSizes(
      [{ height: 20, heightSizingMode: SizingMode.fill, id: 'a', width: 30, widthSizingMode: SizingMode.fill }],
      SizingMode.hug,
      SizingMode.fixed,
    );

    expect(sizes).toEqual([{ height: 20, heightSizingMode: SizingMode.fill, id: 'a', width: 30, widthSizingMode: undefined }]);
  });

  it('should strip the height sizing mode when the height axis hugs', () => {
    const sizes = getFillableAutoLayoutSizes(
      [{ height: 20, heightSizingMode: SizingMode.fill, id: 'a', width: 30, widthSizingMode: SizingMode.fill }],
      SizingMode.fixed,
      SizingMode.hug,
    );

    expect(sizes).toEqual([{ height: 20, heightSizingMode: undefined, id: 'a', width: 30, widthSizingMode: SizingMode.fill }]);
  });

  it('should keep both sizing modes untouched when neither axis hugs', () => {
    const sizes = getFillableAutoLayoutSizes(
      [{ height: 20, heightSizingMode: SizingMode.fill, id: 'a', width: 30, widthSizingMode: SizingMode.fill }],
      SizingMode.fixed,
      SizingMode.fixed,
    );

    expect(sizes).toEqual([{ height: 20, heightSizingMode: SizingMode.fill, id: 'a', width: 30, widthSizingMode: SizingMode.fill }]);
  });
});
