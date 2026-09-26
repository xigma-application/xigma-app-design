// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getRectangleHeaderLabelKey } from '../getRectangleHeaderLabelKey';

const imagePaint: TPaint = { opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' };
const videoPaint: TPaint = { opacity: 100, ref: 'blob:video', rotation: 0, scaleMode: 'fill', type: 'video' };

const makeRectangle = (fills: TPaint[]): TRectangleNode => ({
  fills,
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('getRectangleHeaderLabelKey', () => {
  it('should return the image label when every rectangle is filled only with images', () => {
    // result
    expect(getRectangleHeaderLabelKey([makeRectangle([imagePaint]), makeRectangle([imagePaint])])).toBe('imageLabel');
  });

  it('should return the video label when every rectangle is filled only with videos', () => {
    // result
    expect(getRectangleHeaderLabelKey([makeRectangle([videoPaint])])).toBe('videoLabel');
  });

  it('should return the rectangle label for plain rectangles', () => {
    // result
    expect(getRectangleHeaderLabelKey([makeRectangle([])])).toBe('label');
  });

  it('should return the mixed media label when image and video rectangles are selected together', () => {
    // result
    expect(getRectangleHeaderLabelKey([makeRectangle([imagePaint]), makeRectangle([videoPaint])])).toBe('mixedMediaLabel');
  });

  it('should return the rectangle label when a plain rectangle is selected with a media rectangle', () => {
    // result
    expect(getRectangleHeaderLabelKey([makeRectangle([imagePaint]), makeRectangle([])])).toBe('label');
  });
});
