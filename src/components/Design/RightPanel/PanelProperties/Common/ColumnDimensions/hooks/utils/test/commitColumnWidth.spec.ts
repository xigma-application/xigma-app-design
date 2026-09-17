// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitColumnWidth } from '../commitColumnWidth';

const addImageRectNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 40,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
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

describe('commitColumnWidth', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should commit the node width directly when there is no active image crop', () => {
    // mock
    const commitNodeWidth = vi.fn();

    // before
    commitColumnWidth(store.dispatch, undefined, 100, commitNodeWidth, 200);

    // result
    expect(commitNodeWidth).toHaveBeenCalledWith(200);
  });

  it('should update the image crop width, adjusting height to keep the crop’s own aspect ratio locked, instead of calling commitNodeWidth', () => {
    // mock — a 40x30 crop (4:3 aspect ratio)
    const crop = { height: 30, rotation: 0, width: 40, x: 5, y: 6 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node: selectActivePage(store.getState()).nodes[id] as never, paint, paintIndex: 0 };
    const commitNodeWidth = vi.fn();

    // before — doubling the width keeps the 4:3 ratio, so height doubles too
    commitColumnWidth(store.dispatch, imageCrop, 30, commitNodeWidth, 80);

    // result
    expect(readCrop(id)).toMatchObject({ height: 60, width: 80 });
    expect(commitNodeWidth).not.toHaveBeenCalled();
  });
});
