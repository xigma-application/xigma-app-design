// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitImageCropPosition } from '../commitImageCropPosition';

const addImageRectNode = (paint: TImagePaint, size = 40): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readCrop = (id: string): TImagePaint['crop'] => {
  const node = selectActivePage(store.getState()).nodes[id] as { fills: TImagePaint[] };

  return node.fills[0].crop;
};

describe('commitImageCropPosition', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should write the raw crop values when there is no parent', () => {
    // mock
    const crop = { height: 30, rotation: 0, width: 40, x: 0, y: 0 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node: selectActivePage(store.getState()).nodes[id] as never, paint, paintIndex: 0 };

    // before
    commitImageCropPosition(store.dispatch, imageCrop, undefined, 33, 44);

    // result
    expect(readCrop(id)).toEqual({ ...crop, x: 33, y: 44 });
  });

  it('should offset by the parent origin when a parent is given', () => {
    // mock
    const crop = { height: 30, rotation: 0, width: 40, x: 0, y: 0 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node: selectActivePage(store.getState()).nodes[id] as never, paint, paintIndex: 0 };
    const parent = { height: 300, rotation: 0, width: 400, x: 100, y: 50 };

    // before
    commitImageCropPosition(store.dispatch, imageCrop, parent, 10, 20);

    // result
    expect(readCrop(id)).toEqual({ ...crop, x: 110, y: 70 });
  });
});
