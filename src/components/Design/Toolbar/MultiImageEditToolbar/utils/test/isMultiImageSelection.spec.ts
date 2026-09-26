// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { isMultiImageSelection } from '../isMultiImageSelection';

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

describe('isMultiImageSelection', () => {
  it('should be true for several layers that each have an image fill', () => {
    // result
    expect(isMultiImageSelection([makeRectangle([imagePaint]), makeRectangle([solidPaint, imagePaint])])).toBe(true);
  });

  it('should be false for a single image layer', () => {
    // result
    expect(isMultiImageSelection([makeRectangle([imagePaint])])).toBe(false);
  });

  it('should be false when a selected layer has a video fill or no image fill', () => {
    // result
    expect(isMultiImageSelection([makeRectangle([imagePaint]), makeRectangle([videoPaint])])).toBe(false);
    expect(isMultiImageSelection([makeRectangle([imagePaint]), makeRectangle([imagePaint, videoPaint])])).toBe(false);
    expect(isMultiImageSelection([makeRectangle([imagePaint]), makeRectangle([solidPaint])])).toBe(false);
  });

  it('should be false when a selected layer has no fills at all', () => {
    // mock
    const text = { id: 'text-1', type: NodeType.text } as TSceneNode;

    // result
    expect(isMultiImageSelection([makeRectangle([imagePaint]), text])).toBe(false);
  });
});
