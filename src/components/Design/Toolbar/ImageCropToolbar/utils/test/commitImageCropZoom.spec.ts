// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

// utils
import { commitImageCropZoom } from '../commitImageCropZoom';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const addImageRectNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 200,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TAppearanceNode => selectActivePage(store.getState()).nodes[id] as TAppearanceNode;

const readFills = (id: string): TImagePaint[] => readNode(id).fills as TImagePaint[];

describe('commitImageCropZoom', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    imagePaintTextureSizeCache.clear();
  });

  it('should commit the computed zoom rect onto the paint at the given index', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before
    commitImageCropZoom(store.dispatch, node, paint, 0, 100);

    // result
    expect(readFills(id)[0].crop).toEqual({ height: 400, rotation: 0, width: 400, x: -100, y: -100 });
  });

  it('should leave the node untouched when the image size has not loaded yet', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before
    commitImageCropZoom(store.dispatch, node, paint, 0, 100);

    // result
    expect(readFills(id)[0].crop).toBeUndefined();
  });

  it('should only change the targeted paint index, leaving sibling fills untouched', () => {
    // mock
    imagePaintTextureSizeCache.set('image-1', { height: 400, width: 400 });

    const solidPaint = { color: '#ff0000', opacity: 100, type: 'solid' } as const;
    const imagePaint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    store.dispatch(
      addNode({
        fills: [solidPaint, imagePaint],
        height: 200,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 200,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];
    const node = readNode(id);

    // before
    commitImageCropZoom(store.dispatch, node, imagePaint, 1, 50);

    // result
    expect(readFills(id)[0]).toEqual(solidPaint);
    expect(readFills(id)[1].crop).toEqual({ height: 300, rotation: 0, width: 300, x: -50, y: -50 });
  });
});
