// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { seedImageCropIfNeeded } from '../seedImageCropIfNeeded';

const rectangle: TRectangleNode = {
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 150,
  x: 10,
  y: 20,
};

describe('seedImageCropIfNeeded behaviors', () => {
  it('should seed and dispatch a crop rect matching the node bounds when the image has none yet', () => {
    // mock
    const dispatch = vi.fn();

    // before
    seedImageCropIfNeeded(dispatch, rectangle, 0);

    // result
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          changes: { fills: [{ ...rectangle.fills[0], crop: { height: 100, rotation: 0, width: 150, x: 10, y: 20 } }] },
          id: 'rect-1',
        },
      }),
    );
  });

  it('should not dispatch when the paint already has a stored crop', () => {
    // mock
    const dispatch = vi.fn();
    const alreadyCropped: TRectangleNode = {
      ...rectangle,
      fills: [{ ...rectangle.fills[0], crop: { height: 40, rotation: 0, width: 40, x: 0, y: 0 } } as TRectangleNode['fills'][number]],
    };

    // before
    seedImageCropIfNeeded(dispatch, alreadyCropped, 0);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when there is no node', () => {
    // mock
    const dispatch = vi.fn();

    // before
    seedImageCropIfNeeded(dispatch, undefined, 0);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when the node is not an appearance node', () => {
    // mock
    const dispatch = vi.fn();
    const line = { id: 'line-1', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 };

    // before
    seedImageCropIfNeeded(dispatch, line as never, 0);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when the targeted paint is not an image', () => {
    // mock
    const dispatch = vi.fn();
    const solidRectangle: TRectangleNode = { ...rectangle, fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] };

    // before
    seedImageCropIfNeeded(dispatch, solidRectangle, 0);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should only touch the fill at the given paintIndex, leaving earlier fills untouched', () => {
    // mock
    const dispatch = vi.fn();
    const multiFillRectangle: TRectangleNode = {
      ...rectangle,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }, rectangle.fills[0]],
    };

    // before
    seedImageCropIfNeeded(dispatch, multiFillRectangle, 1);

    // result
    const [action] = dispatch.mock.calls[0];

    expect(action.payload.changes.fills[0]).toEqual({ color: '#ff0000', opacity: 100, type: 'solid' });
    expect(action.payload.changes.fills[1].crop).toEqual({ height: 100, rotation: 0, width: 150, x: 10, y: 20 });
  });
});
