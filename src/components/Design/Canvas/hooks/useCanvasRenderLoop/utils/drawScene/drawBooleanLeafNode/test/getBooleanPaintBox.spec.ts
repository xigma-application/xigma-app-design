// types
import { TBooleanNode } from 'types/design/types';

// utils
import { booleanShape } from './fixtures';
import { getBooleanPaintBox } from '../getBooleanPaintBox';

describe('getBooleanPaintBox', () => {
  it('should paint an unrotated boolean over the bounds of its shape', () => {
    // mock
    const node = { height: 1, rotation: 0, width: 1, x: 0, y: 0 } as TBooleanNode;

    // result
    expect(getBooleanPaintBox(node, booleanShape)).toEqual({ ...booleanShape.bounds, rotation: 0 });
  });

  it('should paint a rotated boolean over its own turned frame so an image turns with it', () => {
    // mock
    const node = { height: 40, rotation: 30, width: 80, x: 5, y: 6 } as TBooleanNode;

    // result
    expect(getBooleanPaintBox(node, booleanShape)).toEqual({ height: 40, rotation: 30, width: 80, x: 5, y: 6 });
  });
});
