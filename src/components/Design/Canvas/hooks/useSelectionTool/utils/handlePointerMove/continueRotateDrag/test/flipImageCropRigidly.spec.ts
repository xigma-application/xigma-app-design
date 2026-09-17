// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { flipImageCropRigidly } from '../flipImageCropRigidly';

const addImageRectNode = (paint: TImagePaint): TRectangleNode => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder, nodes } = selectActivePage(store.getState());

  return nodes[rootOrder[rootOrder.length - 1]] as TRectangleNode;
};

const readPaint = (nodeId: string): TImagePaint => (selectNodes(store.getState())[nodeId] as TRectangleNode).fills[0] as TImagePaint;

describe('flipImageCropRigidly', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should toggle flipX on horizontal flip, leaving flipY and the crop rect untouched', () => {
    // mock
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const node = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node, paint, paintIndex: 0 };

    // action
    flipImageCropRigidly(store.dispatch, imageCrop, 'horizontal');

    // result
    const updated = readPaint(node.id);

    expect(updated.flipX).toBe(true);
    expect(updated.flipY).toBeFalsy();
    expect(updated.crop).toEqual(crop);
  });

  it('should toggle flipY on vertical flip, leaving flipX untouched', () => {
    // mock
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const node = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node, paint, paintIndex: 0 };

    // action
    flipImageCropRigidly(store.dispatch, imageCrop, 'vertical');

    // result
    const updated = readPaint(node.id);

    expect(updated.flipY).toBe(true);
    expect(updated.flipX).toBeFalsy();
  });

  it('should flip back off when toggled a second time on the same axis', () => {
    // mock
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const paint: TImagePaint = { crop, flipX: true, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const node = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node, paint, paintIndex: 0 };

    // action
    flipImageCropRigidly(store.dispatch, imageCrop, 'horizontal');

    // result
    expect(readPaint(node.id).flipX).toBe(false);
  });

  it('should leave the node’s own geometry and fills index untouched, only replacing the targeted paint', () => {
    // mock — a second, unrelated fill alongside the image
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }, paint],
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder, nodes } = selectActivePage(store.getState());
    const node = nodes[rootOrder[rootOrder.length - 1]] as TRectangleNode;
    const imageCrop: TSelectedImageCrop = { crop, node, paint: node.fills[1] as TImagePaint, paintIndex: 1 };

    // action
    flipImageCropRigidly(store.dispatch, imageCrop, 'horizontal');

    // result
    const updatedNode = selectNodes(store.getState())[node.id] as TRectangleNode;

    expect(updatedNode.fills[0]).toEqual({ color: '#ff0000', opacity: 100, type: 'solid' });
    expect((updatedNode.fills[1] as TImagePaint).flipX).toBe(true);
    expect(updatedNode).toMatchObject({ height: 20, rotation: 0, width: 20, x: 0, y: 0 });
  });
});
