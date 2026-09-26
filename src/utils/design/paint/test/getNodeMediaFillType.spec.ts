// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getNodeMediaFillType } from '../getNodeMediaFillType';

const imagePaint: TPaint = { opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' };
const videoPaint: TPaint = { opacity: 100, ref: 'blob:video', rotation: 0, scaleMode: 'fill', type: 'video' };
const solidPaint: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };

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

describe('getNodeMediaFillType', () => {
  it('should return image for a rectangle filled only with images', () => {
    // result
    expect(getNodeMediaFillType(makeRectangle([imagePaint, imagePaint]))).toBe('image');
  });

  it('should return video for a rectangle filled only with videos', () => {
    // result
    expect(getNodeMediaFillType(makeRectangle([videoPaint]))).toBe('video');
  });

  it('should return null for a rectangle without fills or with mixed fills', () => {
    // result
    expect(getNodeMediaFillType(makeRectangle([]))).toBeNull();
    expect(getNodeMediaFillType(makeRectangle([imagePaint, solidPaint]))).toBeNull();
    expect(getNodeMediaFillType(makeRectangle([imagePaint, videoPaint]))).toBeNull();
  });

  it('should return null for a node that is not a rectangle', () => {
    // mock
    const ellipse = { ...makeRectangle([imagePaint]), type: NodeType.ellipse } as TEllipseNode;

    // result
    expect(getNodeMediaFillType(ellipse)).toBeNull();
  });
});
