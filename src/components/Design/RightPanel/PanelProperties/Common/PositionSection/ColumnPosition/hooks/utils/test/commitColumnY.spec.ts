// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitColumnY } from '../commitColumnY';

const addFrame = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

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

const readNode = (id: string): { x: number; y: number } => {
  const node = selectActivePage(store.getState()).nodes[id] as { x: number; y: number };

  return { x: node.x, y: node.y };
};

const readCrop = (id: string): TImagePaint['crop'] => {
  const node = selectActivePage(store.getState()).nodes[id] as { fills: TImagePaint[] };

  return node.fills[0].crop;
};

describe('commitColumnY', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should commit the plain node y when there is no active image crop, keeping x unchanged', () => {
    // mock
    const id = addFrame(0, 0);

    // before
    commitColumnY(store.dispatch, undefined, id, undefined, 33, 44);

    // result
    expect(readNode(id)).toEqual({ x: 33, y: 44 });
  });

  it('should update the image crop y, keeping the given x, when an image crop is active', () => {
    // mock
    const crop = { height: 30, rotation: 0, width: 40, x: 0, y: 0 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const imageCrop: TSelectedImageCrop = { crop, node: selectActivePage(store.getState()).nodes[id] as never, paint, paintIndex: 0 };

    // before
    commitColumnY(store.dispatch, imageCrop, id, undefined, 33, 44);

    // result
    expect(readCrop(id)).toEqual({ ...crop, x: 33, y: 44 });
  });
});
