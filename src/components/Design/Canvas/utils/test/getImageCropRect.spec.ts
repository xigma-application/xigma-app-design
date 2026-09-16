// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getImageCropRect } from '../getImageCropRect';

const node: TRectangleNode = {
  fills: [],
  height: 200,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 15,
  type: NodeType.rectangle,
  width: 300,
  x: 10,
  y: 20,
};

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('getImageCropRect behaviors', () => {
  it('should return the stored crop rect when the paint already has one', () => {
    // before
    const crop = { height: 50, rotation: 30, width: 40, x: 1, y: 2 };

    // result
    expect(getImageCropRect(node, { ...paint, crop })).toBe(crop);
  });

  it('should seed a rect matching the node bounds and rotation when no crop is stored yet', () => {
    // result
    expect(getImageCropRect(node, paint)).toEqual({ height: 200, rotation: 15, width: 300, x: 10, y: 20 });
  });
});
