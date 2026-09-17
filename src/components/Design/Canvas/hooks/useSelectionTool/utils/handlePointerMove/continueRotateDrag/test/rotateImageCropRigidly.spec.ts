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
import { rotateImageCropRigidly } from '../rotateImageCropRigidly';

const addImageRectNode = (crop: TImagePaint['crop']): TRectangleNode => {
  const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

  store.dispatch(
    addNode({ fills: [paint], height: 20, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder, nodes } = selectActivePage(store.getState());

  return nodes[rootOrder[rootOrder.length - 1]] as TRectangleNode;
};

describe('rotateImageCropRigidly', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing when the target rotation matches the crop’s current one', () => {
    // mock
    const crop = { height: 10, rotation: 0, width: 10, x: 5, y: 5 };
    const node = addImageRectNode(crop);
    const imageCrop: TSelectedImageCrop = { crop, node, paint: node.fills[0] as TImagePaint, paintIndex: 0 };

    // action
    rotateImageCropRigidly(store.dispatch, imageCrop, 0);

    // result
    expect((node.fills[0] as TImagePaint).crop).toEqual(crop);
  });

  it('should rotate the crop rigidly around its own centre, updating its rotation and its x/y', () => {
    // mock
    const crop = { height: 10, rotation: 0, width: 10, x: 0, y: 0 };
    const node = addImageRectNode(crop);
    const imageCrop: TSelectedImageCrop = { crop, node, paint: node.fills[0] as TImagePaint, paintIndex: 0 };

    // action
    rotateImageCropRigidly(store.dispatch, imageCrop, 90);

    // result — a square crop centred on (5,5) keeps the same top-left after a 90° rotation about its own centre
    const updated = (selectNodes(store.getState())[node.id] as TRectangleNode).fills[0] as TImagePaint;

    expect(updated.crop).toEqual({ height: 10, rotation: 90, width: 10, x: 0, y: 0 });
  });
});
